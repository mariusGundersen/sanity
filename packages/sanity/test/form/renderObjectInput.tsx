import {jest} from '@jest/globals'
import {type FieldDefinition, type ObjectSchemaType} from '@sanity/types'
import {type ReactElement} from 'react'

import {
  type ComplexElementProps,
  defaultRenderAnnotation,
  defaultRenderBlock,
  defaultRenderField,
  defaultRenderInlineBlock,
  defaultRenderInput,
  defaultRenderItem,
  defaultRenderPreview,
  type FieldMember,
  type ObjectFormNode,
  type ObjectInputProps,
} from '../../src/core'
import {renderInput, type TestRenderInputContext, type TestRenderInputProps} from './renderInput'
import {type TestRenderProps} from './types'

const noopRenderDefault = () => <></>

export type TestRenderObjectInputCallback = (
  inputProps: ObjectInputProps,
  context: TestRenderInputContext,
) => ReactElement

export async function renderObjectInput(options: {
  fieldDefinition: FieldDefinition<'object'>
  props?: TestRenderProps
  render: TestRenderObjectInputCallback
}) {
  const {fieldDefinition, props, render: initialRender} = options

  const onFieldClose = jest.fn()
  const onFieldCollapse = jest.fn()
  const onFieldSetCollapse = jest.fn()
  const onFieldExpand = jest.fn()
  const onFieldSetExpand = jest.fn()
  const onFieldOpen = jest.fn()
  const onFieldGroupSelect = jest.fn()

  function transformProps(
    inputProps: TestRenderInputProps<ComplexElementProps>,
    context: TestRenderInputContext,
  ): ObjectInputProps {
    const {formState} = context
    const {onPathFocus, path, schemaType, value, ...restProps} = inputProps
    const fieldMember = formState.members?.find(
      (member) => member.kind === 'field' && member.name === fieldDefinition.name,
    ) as FieldMember<ObjectFormNode> | undefined
    const field = fieldMember?.field

    return {
      ...restProps,
      changed: false,
      groups: field?.groups || [],
      members: field?.members || [],
      onFieldClose,
      onFieldCollapse,
      onFieldSetCollapse,
      onFieldExpand,
      onFieldSetExpand,
      onFieldGroupSelect,
      onPathFocus: onPathFocus,
      onFieldOpen,
      path,
      renderAnnotation: defaultRenderAnnotation,
      renderBlock: defaultRenderBlock,
      renderField: defaultRenderField,
      renderInlineBlock: defaultRenderInlineBlock,
      renderInput: defaultRenderInput,
      renderItem: defaultRenderItem,
      renderPreview: defaultRenderPreview,
      schemaType: schemaType as ObjectSchemaType,
      value: value as Record<string, any>,
      renderDefault: noopRenderDefault,
    }
  }

  const result = await renderInput<ComplexElementProps>({
    fieldDefinition,
    props,
    render: (inputProps, context) => initialRender(transformProps(inputProps, context), context),
  })

  return result
}
