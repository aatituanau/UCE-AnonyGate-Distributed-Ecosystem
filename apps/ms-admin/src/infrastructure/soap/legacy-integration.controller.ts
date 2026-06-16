import { Controller, Post, Req, Res } from '@nestjs/common';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { Request, Response } from 'express';

@Controller('ws')
export class LegacyIntegrationController {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({ ignoreAttributes: false });
    this.builder = new XMLBuilder({ ignoreAttributes: false, format: true });
  }

  @Post('integration')
  async handleLegacySoap(@Req() req: Request, @Res() res: Response) {
    let rawXml = '';
    
    req.on('data', chunk => {
      rawXml += chunk;
    });

    req.on('end', () => {
      try {
        // 1. Parseamos el XML que nos enviaron
        const parsedData = this.parser.parse(rawXml);
        
        // 2. Armamos la respuesta en formato SOAP (XML puro)
        const responseObj = {
          "?xml": { "@_version": "1.0", "@_encoding": "utf-8" },
          "soap:Envelope": {
            "@_xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "soap:Body": {
              "ValidateUserResponse": {
                "isValid": true,
                "message": "User validated in Legacy UCE System"
              }
            }
          }
        };

        const xmlResponse = this.builder.build(responseObj);
        
        // 3. Retornamos el XML al cliente
        res.set('Content-Type', 'text/xml');
        res.status(200).send(xmlResponse);
      } catch (err) {
        res.status(500).send('<error>Invalid XML format</error>');
      }
    });
  }
}
