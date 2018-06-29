import React, { Component, createRef } from 'react'
import { uniqueId } from 'lodash'

import Toolbar from '../Toolbar'
import Canvas from '../Canvas'
import Sidebar from '../Sidebar'

import './index.css'

const GRID_WIDTH = 50

class App extends Component {
  state = {
    elements: {},
    selectedElements: [],
    areDataShown: false,
    isGridShown: false,
  }

  canvasRef = createRef()

  createElement() {
    const id = uniqueId()

    return {
      ...this.defaultElement,
      label: `Table ${id}`,
      id,
    }
  }

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

  handleDuplicateElements = () => {
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
          x: element.x + 50,
          y: element.y + 50,
          label: `${element.label} (${newId})`,
        }
      }
    }, {})

    this.addElements(newElements)
  }

  editSelectedElements = (fn) => {
    const {
      elements,
      selectedElements,
    } = this.state

    const modifiedElements = selectedElements.reduce((acc, id) => {
      const element = elements[id]

      return {
        ...acc,
        [element.id]: fn(element),
      }
    }, {})

    this.addElements(modifiedElements)
  }

  handleToggleGrid = () => {
    this.setState(({ isGridShown }) => ({
      isGridShown: !isGridShown,
    }))
  }

  handleSnapOnGrid = () => {
    this.editSelectedElements((element) => {
      return {
        ...element,
        x: Math.round(element.x / GRID_WIDTH) * GRID_WIDTH,
        y: Math.round(element.y / GRID_WIDTH) * GRID_WIDTH,
      }
    })
  }

  makeHandleAlignElements = (position) => () => {
    const {
      elements,
      selectedElements,
    } = this.state

    let modifiers = {}
    if (position === 'top') {
      modifiers.y = Math.min.apply(null, selectedElements.map((id) => elements[id].y))
    } else if (position === 'left') {
      modifiers.x = Math.min.apply(null, selectedElements.map((id) => elements[id].x))
    }

    this.editSelectedElements((element) => ({
      ...element,
      ...modifiers,
    }))
  }

  handleClickShowData = () => {
    this.setState(({ areDataShown }) => ({
      areDataShown: !areDataShown
    }))
  }

  handleChangeElements = (e) => {
    try {
      this.setState({
        elements: JSON.parse(e.target.value),
      })
    } catch (e) {}
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
      isGridShown,
      areDataShown,
    } = this.state

    return (
      <div>
        <Toolbar
          hasElementsSelected={selectedElements.length > 0}
          hasMultipleElementsSelected={selectedElements.length > 1}
          isGridShown={isGridShown}
          onAddElement={this.addElement}
          onDuplicateElements={this.handleDuplicateElements}
          onToggleGrid={this.handleToggleGrid}
          onSnapOnGrid={this.handleSnapOnGrid}
          makeOnAlignElements={this.makeHandleAlignElements}
        />
        <div className="App-wrapper">
          <Canvas
            gridWidth={GRID_WIDTH}
            isGridShown={isGridShown}
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
              Show/Edit data (app will be a lot slower when this is open)
            </button>
            {areDataShown && (
              <textarea
                className="App-data-textarea"
                value={JSON.stringify(elements, null, 2)}
                onChange={this.handleChangeElements}
              />
            )}
        </div>
      </div>
    )
  }
}

export default App
