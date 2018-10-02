import React from 'react';

export const childrenOfType = (componentName, typeToAllow) => (props) => {
    const children = React.Children.toArray(props.children);

    if (!children.length) {
        return new Error(`The ${componentName} component must have at least one child of type ${typeToAllow.name}.`);
    }

    for (let i = 0; i < children.length; i += 1) {
        const childType = children[i].type;
        if (childType !== typeToAllow && !(childType.prototype instanceof typeToAllow)) {
            return new Error(`The ${componentName} component only accepts children of type ${typeToAllow.name}.`);
        }
    }

    return null;
};