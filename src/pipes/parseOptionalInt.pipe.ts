import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common"

@Injectable()
export class ParseOptionalIntPipe
  implements PipeTransform<string, number | undefined>
{
  transform(value: string, metadata: ArgumentMetadata): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }
    const val = parseInt(value, 10);
    return isNaN(val) ? undefined : val;
  }
}