import fetch, { RequestInit, Response } from "node-fetch";
import { JSDOM } from "jsdom";

export class WilmaSession {
  wilmaUrl: string;
  studentId: string = "";
  wilma2SID: string = "";
  username: string = "";
  cookies: string = ""; // store cookies here

  constructor(wilmaUrl: string) {
    this.wilmaUrl = wilmaUrl;
  }

  private parseCookies(setCookie: string | null) {
    if (!setCookie) return "";
    return setCookie.split(",").map(c => c.split(";")[0]).join("; ");
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

    console.log(wilma2LoginID)
    this.cookies = `Wilma2LoginID=${wilma2LoginID}`;
    return wilma2LoginID;
  }

  async login(username: string, password: string): Promise<boolean> {
    this.username = username;

    const wilma2LoginID = await this.getWilma2LoginID();
    if (!wilma2LoginID) return false;

    const body = new URLSearchParams({
      Login: username,
      Password: password,
      Submit: "Kirjaudu+sisään",
      SESSIONID: wilma2LoginID
    }).toString();

    const res = await fetch(`${this.wilmaUrl}/login`, {
      method: "POST",
      headers: {
        "Cookie": this.cookies,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      redirect: "manual"
    });
    
    // save session cookies
    const setCookie = res.headers.get("set-cookie");
    this.cookies = this.parseCookies(setCookie);
    
    console.log("hmm:");
    console.log(setCookie);

    if (res.status != 303) {
      console.error(`${res.status} Failed to log in`);
      return false;
    }

    // parse HTML to check for errors and get studentId
    const html = await res.text();
    const dom = new JSDOM(html);
    const error = dom.window.document.querySelector(".alert-error");
    if (error && error.textContent?.toLowerCase().includes("käyttäjätunnusta ei löydy tai salasana on väärä")) {
      console.error("Invalid username or password");
      return false;
    }

    // get Wilma2SID from cookies
    const sidMatch = this.cookies.match(/Wilma2SID=([a-f0-9]{32})/);
    if (!sidMatch) {
      console.error("Failed to get Wilma2SID from cookies");
      return false;
    }
    this.wilma2SID = sidMatch[1];

    return true;
  }
}
