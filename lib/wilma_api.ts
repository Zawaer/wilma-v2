import * as cheerio from 'cheerio';

export class WilmaSession {
  wilmaUrl: string;
  wilma2SID: string = "";
  studentID: string = "";
  username: string = "";

  constructor(wilmaUrl: string) {
    this.wilmaUrl = wilmaUrl;
  }

  async getWilma2LoginID(): Promise<string> {
    const res: Response = await fetch(`${this.wilmaUrl}/token`, { method: "GET" });
    if (!res.ok) {
      console.error(`${res.status} Failed to get Wilma2LoginID`);
      return "";
    }

    const data = await res.json() as { Wilma2LoginID?: string };
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
      }
    });
    
    if (!res.ok) {
      console.error(`${res.status} Failed to get StudentID`);
      return "";
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const studentID = $('#formid').attr('value') ?? "";

    console.log($('#formid'));
    console.log(html);

    if (!studentID || studentID.length !== 47) {
      console.error(`Invalid StudentID: ${studentID}`);
      return "";
    }

    return studentID;
  }

  async login(username: string, password: string): Promise<boolean> {
    // save username
    this.username = username;

    // get Wilma2LoginID
    const wilma2LoginID = await this.getWilma2LoginID();
    if (!wilma2LoginID) {
      return false;
    }

    const body = new URLSearchParams({
      Login: username,
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

    // check that username and password are correct
    const html = await res.text();
    const $ = cheerio.load(html);
    const errorText = $('.alert-error').text().toLowerCase();

    if (errorText.includes("käyttäjätunnusta ei löydy tai salasana on väärä")) {
      console.error("Invalid username or password");
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
