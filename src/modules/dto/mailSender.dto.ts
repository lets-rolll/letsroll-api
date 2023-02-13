export interface MailSenderDto {
    to: string,
    from: string,
    subject: string,
    text: string,
    html?: string
}