import * as cheerio from 'cheerio';
import { Message } from './message-types';

export class WilmaSession {
  wilmaUrl: string;
  wilma2SID: string = "";
  studentID: string = "";
  userName: string = "";
  fullName: string = "";
  schoolName: string = "";

  constructor(wilmaUrl: string) {
    this.wilmaUrl = wilmaUrl;
  }

  async getWilma2LoginID(): Promise<string> {
    const res: Response = await fetch(`${this.wilmaUrl}/token`, {
      method: "GET"
    });
    if (!res.ok) {
      console.error(`${res.status} Failed to get Wilma2LoginID`);
      return "";
    }

    const data = await res.json();
    const wilma2LoginID = data?.Wilma2LoginID;

    if (!wilma2LoginID || wilma2LoginID.length !== 300) {
      console.error(`Invalid Wilma2LoginID: ${wilma2LoginID}`);
      return "";
    }

    return wilma2LoginID;
  }

  async getStudentID(): Promise<string> {
    const res: Response = await fetch(`${this.wilmaUrl}/schedule`, {
      method: "GET",
      headers: {
        "Cookie": `Wilma2SID=${this.wilma2SID}`
      },
      redirect: "manual"
    });
    
    if (!res.ok) {
      console.error(`${res.status} Failed to get StudentID`);
      return "";
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const studentID = $('#formid').attr('value') ?? "";

    // StudentID is usually something like "student:806:64043e5ade2a349d42a3e31b56a72331", its not exactly 40 chars long but it should be good enough to account for different student ID's
    if (!studentID || studentID.length < 40) {
      console.error(`Invalid StudentID: ${studentID}`);
      return "";
    }

    // parse student's full name and school name
    const fullName = $('span.teacher').text().trim();
    const schoolName = $('span.school').text().trim();
    
    this.fullName = fullName;
    this.schoolName = schoolName;

    console.log("student name:");
    console.log(fullName);
    console.log($('span.teacher').text());

    return studentID;
  }

  async getSchedule(): Promise<any> {
    const res: Response = await fetch(`${this.wilmaUrl}/schedule`, {
      method: "GET",
      headers: {
        "Cookie": `Wilma2SID=${this.wilma2SID}`
      }
    });
    
    if (!res.ok) {
      console.error(`${res.status} Failed to get schedule`);
      return null;
    }

    const html = await res.text();
    
    const eventsMatch = html.match(/var eventsJSON = ({[\s\S]*?});[\s\n]*var weekdays/);
    if (!eventsMatch) {
      console.error("Failed to extract events JSON from schedule page");
      return null;
    }

    try {
      const eventsJSON = new Function(`return ${eventsMatch[1]}`)();
      return eventsJSON;
    } catch (error) {
      console.error("Failed to parse events JSON:", error);
      console.error("Matched content:", eventsMatch[1].substring(0, 200));
      return null;
    }
  }

  async getMessages(): Promise<Message[]> {
    const res: Response = await fetch(`${this.wilmaUrl}/messages`, {
      method: "GET",
      headers: {
        "Cookie": `Wilma2SID=${this.wilma2SID}`
      }
    });
    
    if (!res.ok) {
      console.error(`${res.status} Failed to get messages`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const messages: Message[] = [];

    // try multiple selectors cuz i was lazy
    const selectors = [
      '#message-list-table tbody tr',
      '#message-list-table tr[class*="message"]',
      'table.dock tbody tr',
      'tr[data-href]',
      '.index-table tbody tr'
    ];

    for (const selector of selectors) {
      const rows = $(selector);
      console.log(`Selector "${selector}" found ${rows.length} rows`);
      
      if (rows.length > 0) {
        rows.each((_, element) => {
          const row = $(element);
          const cells = row.find('td');
          
          if (cells.length < 3) return;

          let subject = '';
          let sender = '';
          let sentAt = '';
          let id = '';
          let isUnread = false;

          if (cells.length >= 3) {
            const subjectCell = $(cells[2]);
            const subjectLink = subjectCell.find('a');
            subject = (subjectLink.length > 0 ? subjectLink.text() : subjectCell.text()).trim();
            
            const href = subjectLink.attr('href') || '';
            const idMatch = href.match(/\/messages\/(\d+)/);
            id = idMatch ? idMatch[1] : '';
          }

          if (cells.length >= 5) {
            sender = $(cells[4]).text().trim();
          }

          if (cells.length >= 6) {
            sentAt = $(cells[5]).text().trim();
          }

          // check if message is unread
          isUnread = row.hasClass('unread') || row.hasClass('new') || 
                     $(cells[1]).find('.vismaicon-envelope-closed').length > 0 ||
                     $(cells[1]).find('[class*="unread"]').length > 0;

          if (subject && sender) {
            messages.push({
              id: id || `msg-${messages.length}`,
              subject,
              sender,
              sentAt,
              isUnread
            });
          }
        });

        if (messages.length > 0) {
          break; // we found messages with this selector, no need to try others
        }
      }
    }

    console.log(`Total messages found: ${messages.length}`);
    return messages;
  }

  async login(userName: string, password: string): Promise<boolean> {
    // save username
    this.userName = userName;

    // get Wilma2LoginID
    const wilma2LoginID = await this.getWilma2LoginID();
    if (!wilma2LoginID) {
      return false;
    }

    const body = new URLSearchParams({
      Login: userName,
      Password: password,
      Submit: "Kirjaudu+sisään",
      SESSIONID: wilma2LoginID
    }).toString();

    // send the login request
    const res = await fetch(`${this.wilmaUrl}/login`, {
      method: "POST",
      headers: {
        "Cookie": `Wilma2LoginID=${wilma2LoginID}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body,
      redirect: "manual" // this is essential to get the cookies needed because without this the request just gets redirected
    });
    
    if (res.status != 303) {
      console.error(`${res.status} Failed to log in`);
      return false;
    }

    const redirect = res.headers.get("location");

    if (redirect === `${this.wilmaUrl}/?loginfailed`) {
      console.error("Invalid username or password");
      return false;
    }

    if (redirect !== `${this.wilmaUrl}/?checkcookie`) {
      console.error("Login redirects to wrong place:", redirect);
      return false;
    }

    // get Wilma2SID from cookies
    const setCookie = res.headers.get("set-cookie");
    const sidMatch = setCookie?.match(/Wilma2SID=([a-f0-9]{32})/);
    this.wilma2SID = sidMatch ? sidMatch[1] : "";

    // get student ID
    this.studentID = await this.getStudentID();
    if (!this.studentID) {
      return false;
    }

    return true;
  }
}
