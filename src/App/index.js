import React, { Component, createRef } from 'react'
import { uniqueId } from 'lodash'
import getBounds from 'svg-path-bounds';
import svgpath from 'svgpath';

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

  getBbox = (path) => {
    const [left, top, right, bottom] = getBounds(path);

    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  changeElement = (id, data) => {
    this.setState((state) => {
      const nextState = {
        ...state.elements[id],
        ...data,
        bbox: data.path ? this.getBbox(data.path) : state.elements[id].bbox,
        nextBbox: data.nextPath ? this.getBbox(data.nextPath) : state.elements[id].nextBbox,
      };

      if (nextState.nextPath === nextState.path) {
        nextState.nextPath = null;
        nextState.nextBbox = null;
      }

      return {
        elements: {
          ...state.elements,
          [id]: nextState
        }
      }
    })
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
          x: element.x + element.width + 10,
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
      const newPosition = {
        x: Math.round(element.bbox.x / GRID_WIDTH) * GRID_WIDTH,
        y: Math.round(element.bbox.y / GRID_WIDTH) * GRID_WIDTH,
      }
      const newPath = svgpath(element.path).translate(
        newPosition.x - element.bbox.x,
        newPosition.y - element.bbox.y,
      ).toString();

      return {
        ...element,
        path: newPath,
        bbox: this.getBbox(newPath),
      }
    })
  }

  makeHandleAlignElements = (position) => () => {
    const {
      elements,
      selectedElements,
    } = this.state

    let modifiers = {}

    switch (position) {
      case 'top':
        modifiers.y = Math.min.apply(null, selectedElements.map((id) => elements[id].bbox.y))
        break;
      case 'bottom':
        modifiers.y = Math.max.apply(null, selectedElements.map((id) => elements[id].bbox.y + elements[id].bbox.height))
        break;
      case 'left':
        modifiers.x = Math.min.apply(null, selectedElements.map((id) => elements[id].bbox.x))
        break;
      case 'right':
        modifiers.x = Math.max.apply(null, selectedElements.map((id) => elements[id].bbox.x + elements[id].bbox.width))
        break;
      case 'center-x':
        const minX = Math.min.apply(null, selectedElements.map((id) => elements[id].bbox.x));
        const maxX = Math.max.apply(null, selectedElements.map((id) => elements[id].bbox.x + elements[id].bbox.width));
        modifiers.x = minX + (maxX - minX) / 2;
        break;
      case 'center-y':
        const minY = Math.min.apply(null, selectedElements.map((id) => elements[id].bbox.y));
        const maxY = Math.max.apply(null, selectedElements.map((id) => elements[id].bbox.y + elements[id].bbox.height));
        modifiers.y = minY + (maxY - minY) / 2;
        break;
    }

    this.editSelectedElements((element) => {
      let newPath = svgpath(element.path);

      switch (position) {
        case 'top':
          newPath = newPath.translate(0, modifiers.y - element.bbox.y)
          break;
          case 'bottom':
          newPath = newPath.translate(0, modifiers.y - element.bbox.height - element.bbox.y)
          break;
          case 'left':
          newPath = newPath.translate(modifiers.x - element.bbox.x)
          break;
          case 'right':
          newPath = newPath.translate(modifiers.x - element.bbox.width - element.bbox.x)
          break;
          case 'center-x':
          newPath = newPath.translate(modifiers.x - (element.bbox.width / 2) - element.bbox.x)
          break;
          case 'center-y':
          newPath = newPath.translate(0, modifiers.y - (element.bbox.height / 2) - element.bbox.y)
          break;
      }

      newPath = newPath.toString();

      return {
        ...element,
        path: newPath,
        bbox: this.getBbox(newPath),
      }
    })
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

  handleDistributeX = () => {
    const {
      elements,
      selectedElements,
    } = this.state;

    const minX = Math.min(...selectedElements.map((id) => elements[id].bbox.x));
    const maxX = Math.max(...selectedElements.map((id) => elements[id].bbox.x + elements[id].bbox.width));

    const selectionWidth = maxX - minX;
    const elementsWidth = selectedElements.reduce((carry, id) => carry + elements[id].bbox.width, 0);

    const spacingX = (selectionWidth - elementsWidth) / (selectedElements.length - 1);

    selectedElements
      .slice()
      .sort((a, b) => elements[a].bbox.x - elements[b].bbox.x)
      .reduce((x, id) => {
        const element = elements[id];
        const newPath = svgpath(element.path)
          .translate(-element.bbox.x)
          .translate(x)
          .toString();

        this.setState(state => ({
          elements: {
            ...state.elements,
            [element.id]: {
              ...element,
              path: newPath,
              bbox: this.getBbox(newPath),
            },
          }
        }))

        return x + element.bbox.width + spacingX;
      }, minX);
  }

  handleDistributeY = () => {
    const {
      elements,
      selectedElements,
    } = this.state;

    const minY = Math.min(...selectedElements.map((id) => elements[id].bbox.y));
    const maxY = Math.max(...selectedElements.map((id) => elements[id].bbox.y + elements[id].bbox.height));

    const selectionHeight = maxY - minY;
    const elementsHeight = selectedElements.reduce((carry, id) => carry + elements[id].bbox.height, 0);

    const spacing = (selectionHeight - elementsHeight) / (selectedElements.length - 1);

    selectedElements
      .slice()
      .sort((a, b) => elements[a].bbox.y - elements[b].bbox.y)
      .reduce((y, id) => {
        const element = elements[id];
        const newPath = svgpath(element.path)
          .translate(0, -element.bbox.y)
          .translate(0, y)
          .toString();

        this.setState(state => ({
          elements: {
            ...state.elements,
            [element.id]: {
              ...element,
              path: newPath,
              bbox: this.getBbox(newPath),
            },
          }
        }))

        return y + element.bbox.height + spacing;
      }, minY);
  }

  componentDidMount() {
    const {
      width,
      height,
    } = this.canvasRef.current.getBoundingClientRect()

    this.defaultElement = {
      path: 'M 0 0 L50 25 L 100 0 L 100 100 L 0 100 Z',
      bbox: { x: 0, y: 0, width: 100, height: 100 },
      pax: 2,
      nextPath: null,
      nextBbox: null,
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
          onDistributeX={this.handleDistributeX}
          onDistributeY={this.handleDistributeY}
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
