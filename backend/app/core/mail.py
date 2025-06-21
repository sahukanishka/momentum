from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from typing import Dict, Optional, List
import logging
import ssl
import os
from datetime import datetime


logger = logging.getLogger(__name__)


class MailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER_HOST")
        self.smtp_port = os.getenv("SMTP_SERVER_PORT")
        self.smtp_password = os.getenv("SMTP_SERVER_PASSWORD")
        self.sender_email = os.getenv("SMTP_SENDER_EMAIL")

        template_dir = Path(__file__).parent.parent / "templates" / "email"
        self.env = Environment(loader=FileSystemLoader(template_dir))

    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        template_data: Dict,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        try:

            msg = MIMEMultipart()
            msg["From"] = self.sender_email
            msg["To"] = to_email
            msg["Subject"] = subject

            if cc:
                msg["Cc"] = ", ".join(cc)
            if bcc:
                msg["Bcc"] = ", ".join(bcc)

            template = self.env.get_template(f"{template_name}.html")
            html_content = template.render(**template_data)

            msg.attach(MIMEText(html_content, "html"))

            context = ssl.create_default_context()

            with smtplib.SMTP_SSL(
                self.smtp_server, self.smtp_port, context=context
            ) as server:

                try:
                    server.login(self.sender_email, self.smtp_password)
                except smtplib.SMTPAuthenticationError:
                    logger.error("SMTP Authentication failed")
                    return False
                except Exception as e:
                    logger.error(f"SMTP Login error: {str(e)}")
                    return False

                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)

                try:
                    server.sendmail(self.sender_email, recipients, msg.as_string())
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
                except smtplib.SMTPRecipientsRefused as e:
                    logger.error(f"SMTP Recipients Refused: {str(e)}")
                    return False
                except smtplib.SMTPException as e:
                    logger.error(f"SMTP Error: {str(e)}")
                    return False

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def get_template(self, template_name: str, template_data: Dict) -> str:
        template = self.env.get_template(f"{template_name}.html")
        html_content = template.render(**template_data)
        return html_content

    async def send_otp_email(self, to_email: str, otp: str, name: str) -> bool:
        """Send OTP email"""
        subject = "Your Verification Code"
        template_data = {
            "name": name,
            "otp": otp,
            "expiry_minutes": 10,
        }
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="otp",
            template_data=template_data,
        )

    async def send_welcome_email(self, to_email: str, name: str) -> bool:
        """Send welcome email"""
        subject = "Welcome to Our Platform!"
        template_data = {
            "name": name,
            "login_url": f"{os.getenv('DOMAIN_URL')}/login",
        }
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="welcome",
            template_data=template_data,
        )

    async def send_login_credentials_email(
        self, to_email: str, name: str, login_url: str, password: str
    ) -> bool:
        """Send login credentials email"""
        subject = "Your Login Credentials"
        template_data = {
            "name": name,
            "login_url": login_url,
            "password": password,
            "email": to_email,
        }
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="login_credentials",
            template_data=template_data,
        )

    async def send_feedback_email(
        self,
        to_email: str,
        name: str,
        interview_date: str,
        feedback_content: str,
        subject: str = "Case Study Interview Feedback",
    ) -> bool:
        """Send case study interview feedback email with markdown content"""
        template_data = {
            "name": name,
            "feedback_content": feedback_content,
            "interview_date": interview_date,
            "current_year": datetime.now().year,
        }

        return await self.send_email(
            to_email=to_email,
            subject=subject,
            template_name="blank",
            template_data=template_data,
        )
