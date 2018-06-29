import React, { Component, createRef } from 'react'
import { uniqueId } from 'lodash'

import Toolbar from '../Toolbar'
import Canvas from '../Canvas'
import Sidebar from '../Sidebar'

import './index.css'

class App extends Component {
  state = {
    elements: {},
    selectedElements: [],
    isShowingData: false,
  }

  canvasRef = createRef()

  setSelectedElements = (selectedElements = []) => {
    this.setState({
      selectedElements,
    })
  }

  changeElement = (id, data) => {
    this.setState((state) => ({
      elements: {
        ...state.elements,
        [id]: {
          ...state.elements[id],
          ...data,
        }
      }
    }))
  }

  addElement = () => {
    const element = this.createElement()

    this.addElements({
      [element.id]: element,
    })
  }

  addElements = (elements) => {
    this.setState((state) => ({
      elements: {
        ...state.elements,
        ...elements,
      }
    }))
  }

  duplicateElements = () => {
    const {
      elements,
      selectedElements,
    } = this.state

    const newElements = selectedElements.reduce((acc, id) => {
      const element = elements[id]
      const newId = uniqueId()

      return {
        ...acc,
        [newId]: {
          ...element,
          id: newId,
          x: element.x + 20,
          y: element.y + 20,
          label: `${element.label} (${newId})`,
        }
      }
    }, {})

    this.addElements(newElements)
  }

  createElement() {
    const id = uniqueId()

    return {
      ...this.defaultElement,
      label: `Table ${id}`,
      id,
    }
  }

  handleClickShowData = () => {
    this.setState(({ isShowingData }) => ({
      isShowingData: !isShowingData
    }))
  }

  componentDidMount() {
    const {
      width,
      height,
    } = this.canvasRef.current.getBoundingClientRect()

    this.defaultElement = {
      width: 100,
      height: 100,
      x: width / 2 - 100 / 2,
      y: height / 2 - 100 / 2,
      deg: 0,
      pax: 2,
    }

    this.addElement()
  }

  render() {
    const {
      elements,
      selectedElements,
      isShowingData,
    } = this.state

    return (
      <div>
        <Toolbar
          onAddElement={this.addElement}
          onDuplicateElements={this.duplicateElements}
          hasElementsSelected={selectedElements.length > 0}
        />
        <div className="App-wrapper">
          <Canvas
            canvasRef={this.canvasRef}
            elements={Object.values(elements)}
            selectedElements={selectedElements}
            onSetSelectedElements={this.setSelectedElements}
            onChangeElement={this.changeElement}
          />
          <Sidebar
            elements={selectedElements.map((id) => elements[id])}
            onChangeElement={this.changeElement}
          />
        </div>
        <div className="App-data">
            <button onClick={this.handleClickShowData}>
              Show data (app will be a lot slower when this is open)
            </button>
            {isShowingData && (
              <pre>
                {JSON.stringify(elements, null, 2)}
              </pre>
            )}
        </div>
      </div>
    )
  }
}

export default App
