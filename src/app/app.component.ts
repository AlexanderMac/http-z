import { Component, OnInit } from '@angular/core'
import * as httpZ from 'http-z'

import { ParserSamples, Sample } from '@app/samples'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.pug',
})
export class AppComponent implements OnInit {
  samples: Sample[] = ParserSamples
  selectedSample = ParserSamples[0]
  inputVal = ''
  outputVal = ''

  ngOnInit(): void {
    this.inputVal = ParserSamples[0].message
  }

  selectSample(): void {
    this.inputVal = this.selectedSample.message
  }

  exec(): void {
    const plain = this.getPlainFromInput(this.inputVal)
    const model = httpZ.parse(plain)
    this.outputVal = JSON.stringify(model, null, '  ')
  }

  private getPlainFromInput(input: string) {
    return input// TODO.replace(/\n/g, '\r\n')
  }
}
