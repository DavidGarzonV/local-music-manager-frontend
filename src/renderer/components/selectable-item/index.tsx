import React, { useRef } from 'react';
import './styles.scss';

type SelectableItemProps = {
  children: React.ReactNode;
  identifier: string;
  parentClass: string;
  title: string;
  onSelectItem?: (identifier: string) => void;
};

export default function SelectableItem(props: SelectableItemProps) {
  const { children, identifier, parentClass, onSelectItem, title } = props;
  const itemRef = useRef<HTMLDivElement | null>(null);

  const selectItem = () => {
    const selectableElements = document.querySelectorAll(
      `.${parentClass} .selectable-item`,
    );

    selectableElements.forEach((element) => {
      element.classList.remove('selected');
    });

    itemRef.current?.classList.toggle('selected');
    if (onSelectItem) {
      onSelectItem(identifier);
    }
  };

  return (
    <div
      ref={itemRef}
      className="selectable-item"
      onClick={selectItem}
      onKeyDown={selectItem}
      role="button"
      tabIndex={0}
      title={title}
    >
      {children}
    </div>
  );
}
