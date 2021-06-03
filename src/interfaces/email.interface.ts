export interface IMailOptions {
    from?: string;
    // tslint:disable-next-line: no-any
    to: any;
    subject: string;
    html: string;
}