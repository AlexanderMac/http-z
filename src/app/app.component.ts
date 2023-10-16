import { AfterViewInit, Component, ViewChild } from '@angular/core'
import * as httpZ from 'http-z'

import { ModelSamples, PlainSamples, Sample } from '@app/samples'
import { EditorState, Compartment, Extension } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import {http} from "@codemirror/legacy-modes/mode/http"
import { StreamLanguage } from '@codemirror/language'
import { json } from '@codemirror/lang-json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.pug',
})
export class AppComponent implements AfterViewInit {
  selectedOperation: 'parse' | 'build' = 'parse'
  selectedSample!: Sample
  samples: Sample[] = []
  cmInputEditor!: EditorView
  cmOutputEditor!: EditorView

  @ViewChild('input', { static: false }) input: any;
  @ViewChild('output', { static: false }) output: any;

  ngAfterViewInit(): void {
    this.cmInputEditor = this._createCmEditor(this.input.nativeElement)
    this.cmOutputEditor = this._createCmEditor(this.output.nativeElement, true)
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
    if (this.selectedOperation === 'parse') {
      const input = this.cmInputEditor.state.doc.toString()
      const plain = this._getPlainFromInput(input)

      const model = httpZ.parse(plain) // TODO: try/catch
      const output = JSON.stringify(model, null, '  ')
      this._setCmEditorText(this.cmOutputEditor, output)
    } else {
      const input = this.cmInputEditor.state.doc.toString()
      const model = JSON.parse(input) // TODO: try/catch

      const plain = httpZ.build(model) // TODO: try/catch
      this._setCmEditorText(this.cmOutputEditor, plain)
    }
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

  private _createCmEditor(nativeElement: any, isReadonly = false): EditorView {
    return new EditorView({
      parent: nativeElement,
      state: EditorState.create({
        extensions: [
          basicSetup,
        ]
      }),
    });
  }

  private _createCmHttpState(isReadonly = false): EditorState {
    const extensions = [
      basicSetup,
      StreamLanguage.define(http)
    ]
    if (isReadonly) {
      extensions.push(this._createCmStateReadonly())
    }
    return EditorState.create({
      doc: '',
      extensions,
    });
  }

  private _createCmJsonState(isReadonly = false): EditorState {
    const extensions = [
      basicSetup,
      json(),
    ]
    if (isReadonly) {
      extensions.push(this._createCmStateReadonly())
    }
    return EditorState.create({
      doc: '',
      extensions,
    });
  }

  private _createCmStateReadonly(): Extension {
    const readonly = new Compartment()
    return readonly.of(EditorState.readOnly.of(true))
  }

  private _setCmEditorText(cmEditor: EditorView, text: string): void {
    cmEditor.dispatch({changes: {
      from: 0,
      to: cmEditor.state.doc.length,
      insert: text
    }})
  }

  private _getPlainFromInput(input: string): string {
    return input.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
  }
}
