import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

import {CSSTransition} from '@material-ui/react-transition-group';
import debounce from 'lodash/debounce';
import {classNames} from '../../utilities/css';

import {navigationBarCollapsed} from '../../utilities/breakpoints';
import {Key} from '../../types';
import {layer, overlay, Duration} from '../shared';
import {FrameContext} from '../Frame';
import {useI18n} from '../../utilities/i18n';

import Backdrop from '../Backdrop';
import TrapFocus from '../TrapFocus';
import Portal from '../Portal';
import KeypressListener from '../KeypressListener';
import EventListener from '../EventListener';

import styles from './Sheet.scss';

export const BOTTOM_CLASS_NAMES = {
  enter: classNames(styles.Bottom, styles.enterBottom),
  enterActive: classNames(styles.Bottom, styles.enterBottomActive),
  exit: classNames(styles.Bottom, styles.exitBottom),
  exitActive: classNames(styles.Bottom, styles.exitBottomActive),
};

export const RIGHT_CLASS_NAMES = {
  enter: classNames(styles.Right, styles.enterRight),
  enterActive: classNames(styles.Right, styles.enterRightActive),
  exit: classNames(styles.Right, styles.exitRight),
  exitActive: classNames(styles.Right, styles.exitRightActive),
};

export interface Props {
  /** Whether or not the sheet is open */
  open: boolean;
  /** The child elements to render in the sheet */
  children: React.ReactNode;
  /** Callback when the backdrop is clicked or `ESC` is pressed */
  onClose(): void;
}

export interface State {
  mobile: boolean;
}

export default function Sheet({children, open, onClose}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  const frame = useContext(FrameContext);
  const intl = useI18n();

  const findDOMNode = useCallback(() => {
    return container.current;
  }, []);

  const handleResize = useCallback(
    debounce(
      () => {
        if (mobile !== isMobile()) {
          handleToggleMobile();
        }
      },
      40,
      {leading: true, trailing: true, maxWait: 40},
    ),
    [mobile],
  );

  useEffect(
    () => {
      if (frame == null) {
        // eslint-disable-next-line no-console
        console.warn(intl.translate('Polaris.Sheet.warningMessage'));
      }

      if (mobile !== isMobile()) {
        handleToggleMobile();
      }
    },
    [frame, intl, mobile],
  );

  if (frame == null) {
    return null;
  }

  return (
    <Portal idPrefix="sheet">
      <CSSTransition
        findDOMNode={findDOMNode}
        classNames={mobile ? BOTTOM_CLASS_NAMES : RIGHT_CLASS_NAMES}
        timeout={Duration.Slow}
        in={open}
        mountOnEnter
        unmountOnExit
      >
        <div
          className={styles.Container}
          {...layer.props}
          {...overlay.props}
          ref={container}
        >
          <TrapFocus trapping={open}>
            <div role="dialog" tabIndex={-1} className={styles.Sheet}>
              {children}
            </div>
          </TrapFocus>
        </div>
      </CSSTransition>
      <KeypressListener keyCode={Key.Escape} handler={onClose} />
      <EventListener event="resize" handler={handleResize} />
      {open && <Backdrop transparent onClick={onClose} />}
    </Portal>
  );

  function handleToggleMobile() {
    setMobile((mobile) => !mobile);
  }
}

function isMobile(): boolean {
  return navigationBarCollapsed().matches;
}
