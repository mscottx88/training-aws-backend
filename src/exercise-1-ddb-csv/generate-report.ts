import * as ExtractReportData from './extract-report-data';
import * as UploadReport from './upload-report';

export class GenerateReport {
  public static async main(): Promise<void> {
    const reportId: string = await ExtractReportData.Service.main();
    await UploadReport.Service.main({ reportId });
  }
}

if (require.main === module) (async () => await GenerateReport.main())();
