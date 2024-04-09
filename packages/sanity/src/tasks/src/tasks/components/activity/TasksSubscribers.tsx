import {Flex} from '@sanity/ui'
import {useCallback} from 'react'
import {type FormPatch, type PatchEvent, type Path, set} from 'sanity'

import {Button} from '../../../../../ui-components'
import {type TaskDocument} from '../../types'
import {TasksSubscribersMenu} from './TasksSubscribersMenu'

interface TasksSubscriberProps {
  value: TaskDocument
  path?: Path
  onChange: (patch: FormPatch | PatchEvent | FormPatch[]) => void
  currentUserId: string
}

const EMPTY_ARRAY: [] = []

export function TasksSubscribers(props: TasksSubscriberProps) {
  const {value, onChange, path, currentUserId} = props

  const userIsSubscribed = value.subscribers?.includes(currentUserId)

  const buttonText = userIsSubscribed ? 'Unsubscribe' : 'Subscribe'

  const handleUserSubscriptionChange = useCallback(
    (userId: string) => {
      const subscribers = value.subscribers || []

      if (!subscribers.includes(userId)) {
        onChange(set(subscribers.concat(userId), path))
      }
      if (subscribers.includes(userId)) {
        onChange(
          set(
            subscribers.filter((subscriberId) => subscriberId !== userId),
            path,
          ),
        )
      }
    },
    [value.subscribers, onChange, path],
  )

  const handleToggleSubscribe = useCallback(() => {
    handleUserSubscriptionChange(currentUserId)
  }, [handleUserSubscriptionChange, currentUserId])

  return (
    <Flex gap={1} align="center">
      <Button mode="bleed" text={buttonText} onClick={handleToggleSubscribe} />
      <TasksSubscribersMenu
        value={value.subscribers?.filter(Boolean) || EMPTY_ARRAY}
        handleUserSubscriptionChange={handleUserSubscriptionChange}
      />
    </Flex>
  )
}
