import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import svgpath from 'svgpath';

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
    const { x, y } = this.getResizePosition({ next: false });
    this.changeElement((element) => {
      return {
        nextPath: svgpath(element.path)
          .translate(-x, -y)
          .scale(data.scale.x, data.scale.y)
          .translate(x + data.translate.x, y + data.translate.y)
          .toString()
      }
    });
  }

  handleResizeEnd = (data) => {
    const { x, y } = this.getResizePosition({ next: false });
    this.changeElement((element) => {
      return {
        path: svgpath(element.path)
          .translate(-x, -y)
          .scale(data.scale.x, data.scale.y)
          .translate(x + data.translate.x, y + data.translate.y)
          .toString()
      }
    });
  }

  handleDrag = (data) => {
    this.changeElement((element) => ({
      nextPath: svgpath(element.path).translate(data.x, data.y).toString(),
    }))
  }

  handleDragEnd = (data) => {
    this.changeElement((element) => ({
      path: svgpath(element.path).translate(data.x, data.y).toString(),
    }))
  }

  handleRotate = (data) => {
    this.changeElement((element) => {
      return {
        // @TODO Add diff with element's deg
        nextPath: svgpath(element.path).rotate(
          data.deg,
          element.bbox.x + element.bbox.width / 2,
          element.bbox.y + element.bbox.height / 2,
        ).toString(),
      }
    })
  }

  handleRotateEnd = (data) => {
    this.changeElement((element) => {
      return {
        // @TODO Add diff with element's deg
        path: svgpath(element.path).rotate(
          data.deg,
          element.bbox.x + element.bbox.width / 2,
          element.bbox.y + element.bbox.height / 2,
        ).toString(),
      }
    })
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

  getResizePosition = ({ next }) => {
    const {
      elements,
      selectedElements,
    } = this.props

    // @TODO Account for the deg of the elements too
    const position = selectedElements
      .map((id) => elements.find((d) => d.id === id))
      .reduce((acc, element) => {
        const bbox = next ? element.nextBbox || element.bbox : element.bbox;

        return {
          x1: Math.min(acc.x1, bbox.x),
          y1: Math.min(acc.y1, bbox.y),
          x2: Math.max(acc.x2, bbox.x + bbox.width),
          y2: Math.max(acc.y2, bbox.y + bbox.height),
        }
      }, {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity,
      })

    return {
      x: position.x1,
      y: position.y1,
      width: position.x2 - position.x1,
      height: position.y2 - position.y1,
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
            {elements.map((d) => {
              const currentBbox = d.nextBbox || d.bbox;
              const currentPath = d.nextPath || d.path;

              return (
                <g
                  key={d.id}
                  className={classnames(
                    { 'Canvas-element-selected': selectedElements.includes(d.id) },
                  )}
                >
                  <path
                    className="Canvas-rect"
                    d={currentPath}
                    onMouseDown={this.makeHandleClickElement(d.id)}
                  />
                  <g
                    className="Canvas-text"
                    transform={`translate(${currentBbox.x + currentBbox.width / 2} ${currentBbox.y + currentBbox.height / 2})`}
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
              )
            })}
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
            currentPosition={this.getResizePosition({ next: false })}
            displayPosition={this.getResizePosition({ next: true })}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasX={canvasX}
            canvasY={canvasY}
            scale={scale}
            onDrag={this.handleDrag}
            onDragEnd={this.handleDragEnd}
            onResize={this.handleResize}
            onResizeEnd={this.handleResizeEnd}
            onRotate={this.handleRotate}
            onRotateEnd={this.handleRotateEnd}
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
