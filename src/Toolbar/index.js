import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './index.css'

class Toolbar extends Component {
  render() {
    const {
      hasElementsSelected,
      hasMultipleElementsSelected,
      onAddElement,
      onDuplicateElements,
      makeOnAlignElements,
    } = this.props

    return (
      <div className="Toolbar">
        <button onClick={onAddElement}>
          Add rect
        </button>
        <button
          disabled={!hasElementsSelected}
          onClick={onDuplicateElements}
        >
          Duplicate
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('top')}
        >
          Align top
        </button>
        <button
          disabled={!hasMultipleElementsSelected}
          onClick={makeOnAlignElements('left')}
        >
          Align left
        </button>
      </div>
    )
  }
}

Toolbar.propTypes = {
  hasElementsSelected: PropTypes.bool.isRequired,
  hasMultipleElementsSelected: PropTypes.bool.isRequired,
  onAddElement: PropTypes.func.isRequired,
  onDuplicateElements: PropTypes.func.isRequired,
  makeOnAlignElements: PropTypes.func.isRequired,
}

export default Toolbar
