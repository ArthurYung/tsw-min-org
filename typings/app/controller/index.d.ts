// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHome from '../../../app/controller/home';
import ExportReport from '../../../app/controller/report';
import ExportWebApi from '../../../app/controller/webApi';

declare module 'egg' {
  interface IController {
    home: ExportHome;
    report: ExportReport;
    webApi: ExportWebApi;
  }
}
