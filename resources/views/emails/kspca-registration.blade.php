<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        body {
            background-color: #f0f7f4;
            color: #4b5563;
            font-family: sans-serif;
            margin: 0;
            padding: 0;
        }

        .inner-body {
            background-color: #ffffff;
            border-radius: 8px;
            margin: 0 auto;
            width: 570px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .header {
            padding: 20px;
            text-align: center;
            border-bottom: 4px solid #FDB913;
        }

        .content-cell {
            padding: 32px;
        }

        .status-box {
            background-color: #f0f7f4;
            border-left: 4px solid #006738;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <table class="inner-body" width="570" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="header">
                            <div style="font-size: 24px; font-weight: bold; color: #006738;">KUSCCO <span
                                    style="color: #FDB913;">2026</span></div>
                        </td>
                    </tr>
                    <tr>
                        <td class="content-cell">
                            <p style="font-size: 18px; color: #006738;">Dear {{ $name }},</p>
                            <p>Thank you for registering for <strong>THE 11TH ANNUAL SACCO LEADERS' CONVENTION (SLC)
                                    2026</strong>.
                                Your participation in this landmark event is vital for the co-operative movement.</p>

                            <div class="status-box">
                                <p style="margin: 0; font-size: 15px; color: #006738;">
                                    <strong>Status:</strong> Registration Received<br>
                                    <strong>Reference:</strong> {{ $booking_number }}
                                </p>
                            </div>

                            <p><strong>What happens next?</strong></p>
                            <p>We look forward to seeing you at the Pride Inn Paradise Hotel, Shanzu - Mombasa.</p>

                            <p>Warm regards,<br><strong>KUSCCO Event Committee</strong></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>