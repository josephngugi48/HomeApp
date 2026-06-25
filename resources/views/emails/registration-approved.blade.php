<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        .inner-body {
            background-color: #ffffff;
            border-radius: 8px;
            margin: 0 auto;
            width: 570px;
            border: 1px solid #e5e7eb;
        }

        .header {
            padding: 25px;
            text-align: center;
            border-bottom: 4px solid #FDB913;
        }

        .content-cell {
            padding: 35px;
            font-family: sans-serif;
        }

        .qr-section {
            text-align: center;
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px dashed #d1d5db;
        }

        .booking-id {
            font-size: 20px;
            font-weight: bold;
            color: #006738;
            letter-spacing: 2px;
        }
    </style>
</head>

<body style="background-color: #f0f7f4; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <table class="inner-body" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="header">
                            <div style="font-size: 24px; font-weight: bold; color: #006738;">KUSCCO <span
                                    style="color: #FDB913;">2026</span></div>
                        </td>
                    </tr>
                    <tr>
                        <td class="content-cell">
                            <h2 style="color: #006738;">Registration Approved!</h2>
                            <p>Dear {{ $name }},</p>
                            <p>We are delighted to confirm your slot for the tournament. Please present the QR code
                                below at the registration desk on arrival.</p>

                            <div class="qr-section">
                                <p style="margin-bottom: 10px; font-size: 14px; color: #6b7280;">YOUR CHECK-IN QR CODE
                                </p>
                                <img src="{{ $qr_code }}" alt="QR Code" style="width: 180px; height: 180px;">
                                <p class="booking-id">{{ $booking_number }}</p>
                            </div>

                            <table width="100%" style="background-color: #f0f7f4; padding: 15px; border-radius: 8px;">
                                <tr>
                                    <td>
                                        <strong>🗓️ Event Dates:</strong> 16th - 20th February 2026<br>
                                        <strong>📍 Venue:</strong> Pride Inn Paradise Hotel, Shanzu - Mombasa
                                    </td>
                                </tr>
                            </table>
                            <div
                                style="text-align: center; margin-top: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                                <p style="margin-bottom: 15px; font-weight: bold; color: #006738;">Will you be
                                    attending?</p>
                                <a href="{{ $rsvp_link }}"
                                    style="background-color: #006738; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                    Confirm My Attendance
                                </a>
                                <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                                    Please confirm your RSVP to help us with final catering arrangements.
                                </p>
                            </div>
                            <p style="margin-top: 25px;">Warm regards,<br><strong>KUSCCO Event Committee</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>