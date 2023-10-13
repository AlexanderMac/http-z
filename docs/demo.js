const examplesElem = document.getElementById('examples')
const plainToModelElem = document.getElementById('plainToModel')
const modelToPlainElem = document.getElementById('modelToPlain')
const inputElem = document.getElementById('input')
const outputElem = document.getElementById('output')
const execElem = document.getElementById('exec')

parserExamples.forEach(ex => {
  if (ex.name === 'separator') {
    examplesElem.innerHTML += '<option disabled>──────────</option>'
  } else {
    examplesElem.innerHTML += `<option>${ex.name}</option>`
  }
})
inputElem.value = parserExamples[0].message


examplesElem.onchange = function(ev) {
  const exampleName = ev.target.value
  const example = parserExamples.find(ex => ex.name === exampleName)
  inputElem.value = example.message
}

plainToModelElem.onclick = modelToPlainElem.onclick = function() {
  const tmp = inputElem.value
  inputElem.value = outputElem.value
  outputElem.value = tmp
}

execElem.onclick = function() {
  if (plainToModelElem.checked) {
    const plain = getPlainFromInput(inputElem.value)
    const model = httpZ.parse(plain)
    outputElem.value = JSON.stringify(model, 2, '  ')
  } else {
    const model = getModelFromInput(inputElem.value)
    const plain = httpZ.build(model)
    outputElem.value = plain
  }
}

function getPlainFromInput(input) {
  return input.replace(/\n/g, '\r\n')
}

function getModelFromInput(input) {
  try {
    return JSON.parse(input)
  } catch (err) {
    alert('Unable to parse JSON')
  }
}

/*
const originalElem = document.getElementById('original')
const currentElem = document.getElementById('current')
const changesElem = document.getElementById('changes')
const diffValuesElem = document.getElementById('diff-values')
const diffPathsElem = document.getElementById('diff-paths')
const diffElem = document.getElementById('diff')

originalElem.value = getJson(original)
currentElem.value = getJson(current)

diffValuesElem.onclick = function() {
  const original = getObject(originalElem.value)
  const current = getObject(currentElem.value)
  const changes = o2diff.diffValues(original, current)
  changesElem.value = getJson(changes)
}

diffPathsElem.onclick = function() {
  const original = getObject(originalElem.value)
  const current = getObject(currentElem.value)
  const changes = o2diff.diffPaths(original, current)
  changesElem.value = getJson(changes)
}

diffElem.onclick = function() {
  const original = getObject(originalElem.value)
  const current = getObject(currentElem.value)
  const changes = o2diff.diff(original, current)
  changesElem.value = getJson(changes)
}
*/