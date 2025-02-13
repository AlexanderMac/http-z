import { CommonModule } from '@angular/common'
import { AfterViewInit, Component, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { json } from '@codemirror/lang-json'
import { StreamLanguage } from '@codemirror/language'
import { http } from '@codemirror/legacy-modes/mode/http'
import { Compartment, EditorState, Extension } from '@codemirror/state'
import { basicSetup, EditorView } from 'codemirror'
import * as httpZ from 'http-z'
import { attempt, isError } from 'lodash'

import { ModelSamples, PlainSamples, Sample } from '@app/samples'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, FormsModule],
})
export class AppComponent implements AfterViewInit {
  selectedOperation: 'parse' | 'build' = 'parse'
  selectedSample!: Sample
  samples: Sample[] = []
  cmInputEditor!: EditorView
  cmOutputEditor!: EditorView
  inputSuccess = ''
  inputError = ''
  libVersion = httpZ.getLibVersion()

  @ViewChild('input', { static: false }) input: any
  @ViewChild('output', { static: false }) output: any

  ngAfterViewInit(): void {
    this.cmInputEditor = this._createCmEditor(this.input.nativeElement)
    this.cmOutputEditor = this._createCmEditor(this.output.nativeElement)
    this._setOperation()
  }

  selectOperation(): void {
    this._setOperation()
  }

  selectSample(): void {
    this._setCmEditorText(this.cmInputEditor, this.selectedSample.message)
    this.exec()
  }

  exec(): void {
    this._clearMessages()
    const success = this.selectedOperation === 'parse' ? this._parse() : this._build()
    if (success) {
      this.inputSuccess = 'Success'
    }
  }

  private _parse(): boolean {
    const input = this.cmInputEditor.state.doc.toString()
    const plain = this._getPlainFromInput(input)

    const model = attempt(httpZ.parse.bind(httpZ, plain))
    if (isError(model)) {
      this.inputError = model.message
      return false
    }

    const output = JSON.stringify(model, null, '  ')
    this._setCmEditorText(this.cmOutputEditor, output)

    return true
  }

  private _build(): boolean {
    const input = this.cmInputEditor.state.doc.toString()
    const model = attempt(JSON.parse.bind(JSON, input))
    if (isError(model)) {
      this.inputError = model.message
      return false
    }

    const plain = attempt(httpZ.build.bind(httpZ, model))
    if (isError(plain)) {
      this.inputError = plain.message
      return false
    }
    this._setCmEditorText(this.cmOutputEditor, plain)

    return true
  }

  private _setOperation(): void {
    let samples: Sample[]
    if (this.selectedOperation === 'parse') {
      this.cmInputEditor.setState(this._createCmHttpState())
      this.cmOutputEditor.setState(this._createCmJsonState(true))
      samples = PlainSamples
    } else {
      this.cmInputEditor.setState(this._createCmJsonState())
      this.cmOutputEditor.setState(this._createCmHttpState(true))
      samples = ModelSamples
    }

    this.samples.splice(0, this.samples.length)
    this.samples.push(...samples)

    setTimeout(() => {
      this.selectedSample = samples[0]
      this.selectSample()
    })
  }

  private _createCmEditor(nativeElement: any): EditorView {
    return new EditorView({
      parent: nativeElement,
      state: EditorState.create({
        extensions: [basicSetup],
      }),
    })
  }

  private _createCmHttpState(isReadonly = false): EditorState {
    const extensions = [basicSetup, StreamLanguage.define(http)]
    if (isReadonly) {
      extensions.push(this._createCmStateReadonly())
    }
    return EditorState.create({
      doc: '',
      extensions,
    })
  }

  private _createCmJsonState(isReadonly = false): EditorState {
    const extensions = [basicSetup, json()]
    if (isReadonly) {
      extensions.push(this._createCmStateReadonly())
    }
    return EditorState.create({
      doc: '',
      extensions,
    })
  }

  private _createCmStateReadonly(): Extension {
    const readonly = new Compartment()
    return readonly.of(EditorState.readOnly.of(true))
  }

  private _setCmEditorText(cmEditor: EditorView, text: string): void {
    cmEditor.dispatch({
      changes: {
        from: 0,
        to: cmEditor.state.doc.length,
        insert: text,
      },
    })
  }

  private _getPlainFromInput(input: string): string {
    return input.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
  }

  private _clearMessages(): void {
    this.inputSuccess = ''
    this.inputError = ''
  }
}
