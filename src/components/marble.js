import Cycle from 'cyclejs';
import svg from 'cyclejs/node_modules/virtual-dom/virtual-hyperscript/svg';
import Colors from 'rxmarbles/styles/colors';
import {mergeStyles, svgElevation1Style, textUnselectable}
  from 'rxmarbles/styles/utils';
let Rx = Cycle.Rx;
let h = Cycle.h;

let MarbleModel = Cycle.createModel((Properties, Intent) => ({
  data$: Properties.get('data$'),
  isDraggable$: Properties.get('isDraggable$').startWith(false),
  style$: Properties.get('style$').startWith({}),
  isHighlighted$: Rx.Observable.merge(
    Intent.get('startHighlight$').map(() => true),
    Intent.get('stopHighlight$').map(() => false)
  ).startWith(false)
}));

let MarbleView = Cycle.createView(Model => {
  let POSSIBLE_COLORS = [Colors.blue, Colors.green, Colors.yellow, Colors.red];

  let draggableContainerStyle = {
    cursor: 'ew-resize'
  };

  function createContainerStyle(inputStyle) {
    return {
      width: inputStyle.size,
      height: inputStyle.size,
      position: 'relative',
      display: 'inline-block',
      margin: `calc(0px - (${inputStyle.size} / 2))`,
      bottom: `calc((100% - ${inputStyle.size}) / 2)`,
      cursor: 'default'
    };
  }

  function vrenderSvg(data, isDraggable, inputStyle, isHighlighted) {
    let color = POSSIBLE_COLORS[data.get('id') % POSSIBLE_COLORS.length];
    return svg('svg.marbleShape', {
      style: mergeStyles({
        overflow: 'visible',
        width: inputStyle.size,
        height: inputStyle.size},
        isDraggable && isHighlighted ? svgElevation1Style : {}),
      attributes: {viewBox: '0 0 1 1'}},
      [
        svg('circle', {
          style: {
            stroke: Colors.black,
            fill: color
          },
          attributes: {
            cx: 0.5, cy: 0.5, r: 0.47,
            'stroke-width': '0.06px'
          }
        })
      ]
    );
  }

  function vrenderInnerContent(data, inputStyle) {
    return h('p.marbleContent', {
      style: mergeStyles({
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0',
        margin: '0',
        textAlign: 'center',
        lineHeight: inputStyle.size},
        textUnselectable)
    }, `${data.get('content')}`);
  }

  function vrender(data, isDraggable, inputStyle, isHighlighted) {
    return h('div.marbleRoot', {
      style: mergeStyles({
        left: `${data.get('time')}%`,
        zIndex: data.get('time')},
        createContainerStyle(inputStyle),
        isDraggable ? draggableContainerStyle : null),
      attributes: {'data-marble-id': data.get('id')}
    },[
      vrenderSvg(data, isDraggable, inputStyle, isHighlighted),
      vrenderInnerContent(data, inputStyle)
    ]);
  }

  return {
    vtree$: Rx.Observable.combineLatest(
      Model.get('data$'),
      Model.get('isDraggable$'),
      Model.get('style$'),
      Model.get('isHighlighted$'),
      vrender
    )
  }
});

let MarbleIntent = Cycle.createIntent(User => ({
  startHighlight$: User.event$('.marbleRoot', 'mouseenter').map(() => 1),
  stopHighlight$: User.event$('.marbleRoot', 'mouseleave').map(() => 1)
}));

function MarbleComponent(User, Properties) {
  let Model = MarbleModel.clone();
  let View = MarbleView.clone();
  let Intent = MarbleIntent.clone();

  User.inject(View).inject(Model).inject(Properties, Intent)[1].inject(User);

  return {
    // mousedown$: User.event$('.marbleRoot', 'mousedown')
  };
}

module.exports = MarbleComponent;
