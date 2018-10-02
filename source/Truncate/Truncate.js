import React from 'react';
import PropTypes from 'prop-types';
import Text from '../Text';
import {childrenOfType} from '../propTypes';

const DefaultContainer = <span />;

const conversionText = 'I am the conversion text';
const conversionTextLength = conversionText.length;
const lineEndingTextLengthBuffer = 7;

class Truncate extends React.PureComponent {
  constructor(props) {
    super(props);

    this.element = '';
    this.isTruncated = false;
    this.texts = this.flattenChildrenText();

    this.setReference = this.setReference.bind(this);
    this.onTruncate = this.onTruncate.bind(this);
    this.truncate = this.truncate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.initMeasurementCanvas();
  }

  componentDidMount() {
    this.truncate('mount');

    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);

    window.cancelAnimationFrame(this.timeout);
  }

  onTruncate(trigger) {
    const {onTruncate} = this.props;

    this.forceUpdate();

    if (typeof onTruncate === 'function') {
      this.timeout = window.requestAnimationFrame(() => {
        onTruncate(this.isTruncated, trigger);
      });
    }
  }

  onResize() {
    if (this.timeout) {
      window.cancelAnimationFrame(this.timeout);
    }

    this.timeout = window.requestAnimationFrame(() => {
      this.truncate('resize');
    });
  }

  setReference(instance) {
    this.element = instance;
  }

  getAvailableTextLength() {
    const {lines, extraWidth} = this.props;

    const style = window.getComputedStyle(this.element);
    const ellipsisWidth = this.ellipsis.textContent.length;
    console.log(ellipsisWidth);

    // Fetch font container font styles for better width calculation and apply to measurement canvas
    const font = [
      style['font-weight'],
      style['font-style'],
      style['font-size'],
      style['font-family'],
    ].join(' ');
    this.canvasContext.font = font;

    // Get available text width based on the number of lines from measurement canvas
    // Remove padding from each ends
    // TODO Later add the calculated width for the ellipsis ...
    const singleLineWidthMinusPadding =
      parseFloat(style.width) -
      (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight));

    const availableWidth = lines * singleLineWidthMinusPadding - extraWidth;

    const conversionTextWidth = this.canvasContext.measureText(conversionText)
      .width;

    // Convert width into string length...
    // TODO Change the way we handle line endings to a more bullet proof method...
    return (
      Math.floor(
        (conversionTextLength * availableWidth) / conversionTextWidth,
      ) -
      (lines * lineEndingTextLengthBuffer + ellipsisWidth)
    );
  }

  flattenChildrenText() {
    const {children} = this.props;
    const childrenArray = React.Children.toArray(children);
    let texts = [];
    for (let i = 0; i < childrenArray.length; i += 1) {
      texts = [...texts, ...childrenArray[i].props.texts];
    }
    return texts;
  }

  truncate(trigger) {
    this.texts = this.flattenChildrenText();
    const newAvailableTextLength = this.getAvailableTextLength();

    // Let's parsed the available text length
    let incrementedText = '';
    this.isTruncated = false;
    for (let i = 0; i < this.texts.length; i += 1) {
      if (this.isTruncated) {
        this.texts[i] = null;
      } else {
        const previousTextLength = incrementedText.length;
        incrementedText += `${this.texts[i]} `;
        if (newAvailableTextLength < incrementedText.length) {
          const remainingTextLength =
            newAvailableTextLength - previousTextLength;
          this.texts[i] = this.texts[i].substring(0, remainingTextLength);
          this.isTruncated = true;
        }
      }
    }

    return this.onTruncate(trigger);
  }

  initMeasurementCanvas() {
    const canvas = document.createElement('canvas');
    this.canvasContext = canvas.getContext('2d');
  }

  renderText() {
    const {children} = this.props;
    const childrenArray = React.Children.toArray(children);
    const content = [];
    let textStartingIndex = 0;
    for (let i = 0; i < childrenArray.length; i += 1) {
      const {textRenderer, texts} = childrenArray[i].props;
      const nextTextStartingIndex = textStartingIndex + texts.length;
      content.push(
        textRenderer(
          ...this.texts.slice(textStartingIndex, nextTextStartingIndex),
        ),
      );
      content.push(' ');
      textStartingIndex = nextTextStartingIndex;
    }
    return React.createElement('span', {}, ...content);
  }

  render() {
    const {container: Container, containerId, ellipsis, ...rest} = this.props;

    return (
      <Container innerRef={this.setReference} id={containerId} {...rest}>
        {this.renderText()}
        <span
          ref={instance => {
            this.ellipsis = instance;
          }}
          style={{visibility: this.isTruncated ? 'visible' : 'hidden'}}
        >
          {ellipsis}
        </span>
      </Container>
    );
  }
}

Truncate.propTypes = {
  children: childrenOfType('Truncate', Text),
  ellipsis: PropTypes.node,
  container: PropTypes.func,
  containerId: PropTypes.string,
  lines: PropTypes.number,
  onTruncate: PropTypes.func,
  extraWidth: PropTypes.number,
  includeSpaceOnRender: PropTypes.bool,
};

Truncate.defaultProps = {
  ellipsis: '...',
  container: DefaultContainer,
  lines: 1,
  extraWidth: 0,
  includeSpaceOnRender: true,
};

export default Truncate;
