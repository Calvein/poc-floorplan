import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Resizer from '../Resizer'

import './index.css'

class Canvas extends Component {
  state = {
    canvasWidth: 0,
    canvasHeight: 0,
    canvasX: 0,
    canvasY: 0,
    scale: 1,
  }

  componentDidMount() {
    this.updateCanvasPosition()
  }

  handleClickCanvas = () => {
    const { onSetSelectedElements } = this.props

    onSetSelectedElements()
  }

  makeHandleClickElement = (id) => (e) => {
    e.stopPropagation()
    this.toggleElement(id)
  }

  changeElement = (fn) => {
    const {
      elements,
      selectedElements,
      onChangeElement,
    } = this.props

    selectedElements.forEach((id) => {
      const element = elements.find((element) => element.id === id)
      onChangeElement(id, fn(element))
    })

  }

  handleResize = (data) => {
    this.changeElement((element) => ({
      width: element.width + data.x2,
      height: element.height + data.y2,
      x: element.x + data.x1,
      y: element.y + data.y1,
    }))
  }

  handleDrag = (data) => {
    this.changeElement((element) => ({
      x: element.x + data.x,
      y: element.y + data.y,
    }))
  }

  handleRotate = (data) => {
    this.changeElement((element) => ({
      // @TODO Add diff with element's deg
      deg: data.deg,
    }))
  }

  updateCanvasPosition = () => {
    const {
      width,
      height,
      x,
      y,
    } = this.props.canvasRef.current.getBoundingClientRect()

    this.setState({
      canvasWidth: width,
      canvasHeight: height,
      canvasX: x,
      canvasY: y,
    })
  }

  toggleElement = (id) => {
    const {
      selectedElements,
      onSetSelectedElements,
    } = this.props

    if (selectedElements.includes(id)) {
      return onSetSelectedElements(selectedElements.filter((selectedId) => selectedId !== id))
    }

    onSetSelectedElements([
      ...selectedElements,
      id,
    ])
  }

  handleChangeScale = (e) => {
    this.setState({
      scale: +e.target.value,
    })
  }

  getResizePosition = () => {
    const {
      elements,
      selectedElements,
    } = this.props

    // @TODO Account for the deg of the elements too
    const position = selectedElements
      .map((id) => elements.find((d) => d.id === id))
      .reduce((acc, element) => ({
        x1: Math.min(acc.x1, element.x),
        y1: Math.min(acc.y1, element.y),
        x2: Math.max(acc.x2, element.x + element.width),
        y2: Math.max(acc.y2, element.y + element.height),
      }), {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity,
      })

    return {
      x1: position.x1 - 8,
      y1: position.y1 - 8,
      x2: position.x2 + 8,
      y2: position.y2 + 8,
    }
  }

  render() {
    const {
      gridWidth,
      isGridShown,
      canvasRef,
      elements,
      selectedElements,
    } = this.props

    const {
      canvasWidth,
      canvasHeight,
      canvasX,
      canvasY,
      scale,
    } = this.state

    return (
      <div className="Canvas">
        <svg
          className="Canvas-svg"
          ref={canvasRef}
          onClick={this.handleClickCanvas}
        >
          <defs>
            <pattern
              id="smallGrid"
              width={gridWidth / 10}
              height={gridWidth / 10}
              patternUnits="userSpaceOnUse"
            >
              <path d={`M ${gridWidth / 10} 0 L 0 0 0 ${gridWidth / 10}`} />
            </pattern>
            <pattern
              id="grid"
              width={gridWidth}
              height={gridWidth}
              patternUnits="userSpaceOnUse"
            >
               <rect
                width={gridWidth}
                height={gridWidth}
                fill="url(#smallGrid)"
              />
                <path d={`M ${gridWidth} 0 L 0 0 0 ${gridWidth}`} />
             </pattern>
          </defs>
          <g transform={`scale(${scale})`}>
            {isGridShown && (
              <rect
                width="1000%"
                height="1000%"
                fill="url(#grid)"
              />
            )}
            {elements.map((d) => (
              <g
                key={d.id}
                className={classnames(
                  { 'Canvas-element-selected': selectedElements.includes(d.id) },
                )}
                transform={`translate(${d.x} ${d.y})`}
              >
                <rect
                  className="Canvas-rect"
                  transform={`rotate(${d.deg}, ${d.width / 2}, ${d.height / 2})`}
                  width={d.width}
                  height={d.height}
                  onClick={this.makeHandleClickElement(d.id)}
                />
                <g
                  className="Canvas-text"
                  transform={`translate(8 ${d.height / 2})`}
                >
                  <text className="Canvas-text-label">
                    {d.label}
                  </text>
                  <text
                    className="Canvas-text-pax"
                    dy="18"
                  >
                    {d.pax}p
                  </text>
                </g>
              </g>
            ))}
          </g>
        </svg>
        <div className="Canvas-zoom">
          {Math.floor(scale * 100)}%
          <input
            type="range"
            value={scale}
            min={0.25}
            max={1.75}
            step={0.05}
            onChange={this.handleChangeScale}
          />
        </div>
        {selectedElements.length >= 1 && (
          <Resizer
            position={this.getResizePosition()}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasX={canvasX}
            canvasY={canvasY}
            scale={scale}
            onDrag={this.handleDrag}
            onResize={this.handleResize}
            onRotate={this.handleRotate}
          />
        )}
      </div>
    )
  }
}

Canvas.propTypes = {
  gridWidth: PropTypes.number.isRequired,
  isGridShown: PropTypes.bool.isRequired,
  canvasRef: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired,
  selectedElements: PropTypes.array.isRequired,
  onSetSelectedElements: PropTypes.func.isRequired,
  onChangeElement: PropTypes.func.isRequired,
}

export default Canvas
