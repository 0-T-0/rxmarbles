Rx = require 'rx'
InputDiagramView = require 'rxmarbles/views/input-diagram'
OutputDiagramView = require 'rxmarbles/views/output-diagram'
FunctionBox = require 'rxmarbles/views/function-box'
Utils = require 'rxmarbles/views/utils'

#
# Responsible for startup and connecting controller streams to the views
#

streamOfArrayOfLiveInputDiagramStreams = new Rx.BehaviorSubject(null)

createInputDiagramElements = ->
  InputDiagrams = require 'rxmarbles/controllers/input-diagrams'
  inputDiagramElements = Utils.renderObservableDOMElement(
    InputDiagrams.initial$
      .map((diagrams) ->
        return (InputDiagramView.render(d) for d in diagrams)
      )
      .doAction((diagramViews) ->
        streamOfArrayOfLiveInputDiagramStreams.onNext(
          (diagram.dataStream for diagram in diagramViews)
        )
      )
  )
  return inputDiagramElements

createFunctionBoxElement = ->
  SelectedExample = require 'rxmarbles/controllers/selected-example'
  return Utils.renderObservableDOMElement(
    SelectedExample.stream
      .map((example) -> FunctionBox.render(example))
  )

createOutputDiagramElement = ->
  OutputDiagram = require 'rxmarbles/controllers/output-diagram'
  return OutputDiagramView.render(OutputDiagram)


module.exports = {
  getStreamOfArrayOfLiveInputDiagramStreams: ->
    return streamOfArrayOfLiveInputDiagramStreams

  render: ->
    rootElement = document.createElement("div")
    rootElement.appendChild(createInputDiagramElements())
    rootElement.appendChild(createFunctionBoxElement())
    rootElement.appendChild(createOutputDiagramElement())
    return rootElement
}
