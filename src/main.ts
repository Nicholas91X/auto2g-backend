import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { join } from "path"
import { NestExpressApplication } from "@nestjs/platform-express"
import { ValidationPipe } from "@nestjs/common"
import * as express from "express"
import configuration from "./shared/configuration"
import { DatabaseExceptionFilter } from "./exceptions/database.exception.filter"
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useStaticAssets(join(process.cwd(), "uploads", "profile-pictures"), {
    prefix: "/public/profile-pictures/",
  })

  app.use(express.urlencoded({ limit: "50mb", extended: true }))

  const settings = configuration()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  console.log("Allowed CORS hosts: ", settings.cors["allowedHosts"])
  // app.enableCors({
  //   origin: settings.cors['allowedHosts'],
  //   credentials: true,
  //   allowedHeaders: [ 'Origin', 'Authorization', 'X-Requested-With', 'Content-Type', 'Accept',  ]
  // })
  app.enableCors()

  /** SWAGGER **/

  // const swaggerUser = process.env.SWAGGER_USER
  // const swaggerPassword = process.env.SWAGGER_PASSWORD

  // if (swaggerUser && swaggerPassword) {
  //   app.use(
  //     ['/docs', '/docs-json'],
  //     basicAuth({
  //       challenge: true,
  //       users: {
  //         [swaggerUser]: swaggerPassword,
  //       },
  //     }),
  //   );
  // }

  const config = new DocumentBuilder()
    .setTitle("Auto2G API")
    .setDescription("API per la gestione della concessionaria Auto2G")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "bearer",
    )
    .build()

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  }

  const document = SwaggerModule.createDocument(app, config, options)
  SwaggerModule.setup("docs", app, document)

  /** END SWAGGER **/

  // TODO: CORS

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  /**
   * Globaly Catches Exceptions from database
   * and handle those as Internal Server Error (500)
   * */
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new DatabaseExceptionFilter(httpAdapter))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
