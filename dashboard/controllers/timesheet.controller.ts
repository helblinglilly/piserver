import * as ex from "express";
const model = require("../models/timsheets.model");

class TimesheetController {
  static getIndex = (req: ex.Request, res: ex.Response) => {
    res.sendStatus(200);
  };

  static getEdit(
    arg0: string,
    userSelection: (req: any, res: any, next: any) => Promise<void>,
    getEdit: any,
  ) {
    throw new Error("Method not implemented.");
  }
  static postEdit(
    arg0: string,
    userSelection: (req: any, res: any, next: any) => Promise<void>,
    postEdit: any,
  ) {
    throw new Error("Method not implemented.");
  }
  static getView(
    arg0: string,
    userSelection: (req: any, res: any, next: any) => Promise<void>,
    getView: any,
  ) {
    throw new Error("Method not implemented.");
  }
  static postEnter(
    arg0: string,
    userSelection: (req: any, res: any, next: any) => Promise<void>,
    postEnter: any,
  ) {
    throw new Error("Method not implemented.");
  }
}

export default TimesheetController;
