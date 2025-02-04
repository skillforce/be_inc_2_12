export const emailTemplate = (emailBodyLayout: string) => {
  return `<!DOCTYPE html>
  <html>
      <head>
          <meta charset="UTF-8">
  <meta name="viewport"
} content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    table {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      border-collapse: collapse;
    }
    td {
      padding: 20px;
    }
    h1 {
      color: #333;
      margin: 0;
    }
    p {
      color: #555;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 10px;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 20px;
      font-size: 14px;
      color: #777;
    }
  </style>
</head>
<body>
<table>
  <tr>
    <td>
   ${emailBodyLayout}
    </td>
  </tr>
</table>
</body>
</html>`;
};
