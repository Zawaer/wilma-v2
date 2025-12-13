export interface ScheduleEvent {
  Id: string;
  ViikonPaiva: string;
  SijId: string;
  Tyyppi: string;
  Date: string;
  Start: number; // minutes from midnight
  End: number; // minutes from midnight
  Text: { [key: string]: string };
  LongText: { [key: string]: string };
  MinuuttiSij: string;
  X1: number; // position in grid (0-50000)
  X2: number; // position in grid (0-50000)
  Y1: number;
  Y2: number;
  ShowClasses: number;
  Lk: string;
  Color: string;
  AllowOverlap: number;
  Opet: { [key: string]: string };
  Huoneet: { [key: string]: string };
  [key: string]: unknown;
}

export interface ScheduleData {
  ViewOnly: boolean;
  DayCount: number;
  DayStarts: number; // minutes from midnight
  DayEnds: number; // minutes from midnight
  Events: ScheduleEvent[];
  ActiveTyyppi: string;
  ActiveId: string;
  DialogEnabled: number;
}
