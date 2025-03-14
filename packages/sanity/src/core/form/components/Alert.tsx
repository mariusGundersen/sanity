import {ErrorOutlineIcon, WarningOutlineIcon} from '@sanity/icons'
import {Box, Card, Flex, Text} from '@sanity/ui'
import {type ComponentProps, type ReactNode} from 'react'
import {styled} from 'styled-components'

interface AlertProps extends Omit<ComponentProps<typeof Card>, 'title'> {
  title: ReactNode
  status?: 'warning' | 'error'
  suffix?: ReactNode
}

const STATUS_TONES = {
  warning: 'caution',
  error: 'critical',
} as const

const SuffixBox = styled(Box)`
  border-top: 1px solid var(--card-border-color);
`

export function Alert(props: AlertProps) {
  const {children, status = 'warning', suffix, title, ...rest} = props

  return (
    <Card radius={2} tone={STATUS_TONES[status]} {...rest} data-ui="Alert">
      <Flex padding={4}>
        <Box>
          <Text size={1}>
            {status === 'warning' && <WarningOutlineIcon />}
            {status === 'error' && <ErrorOutlineIcon />}
          </Text>
        </Box>

        <Box flex={1} marginLeft={3}>
          <Text size={1} weight="medium">
            {title}
          </Text>

          {children && <Box marginTop={3}>{children}</Box>}
        </Box>
      </Flex>

      {suffix && <SuffixBox>{suffix}</SuffixBox>}
    </Card>
  )
}
