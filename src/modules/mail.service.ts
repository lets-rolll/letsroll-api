import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSenderDto } from './dto/mailSender.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public Send(dto: MailSenderDto): void {    
    this.mailerService
      .sendMail({
        to: dto.to, 
        from: dto.from,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
      })
      .then(() => {
        console.log("Mail has been sended");
        
      })
      .catch((e) => {
        console.log(e);
        
      });
  }
}