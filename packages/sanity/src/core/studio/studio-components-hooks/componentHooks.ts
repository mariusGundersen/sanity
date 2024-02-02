import {ComponentType} from 'react'
import {
  ActiveToolLayoutProps,
  LayoutProps,
  LogoProps,
  NavbarProps,
  ToolMenuProps,
} from '../../config/studio'
import {useMiddlewareComponents} from '../../config'
import {StudioLogo, StudioNavbar, StudioToolMenu} from '../components'
import {StudioLayoutComponent} from '../StudioLayout'
import {StudioActiveToolLayout} from '../components/navbar/StudioActiveToolLayout'
import {
  pickToolMenuComponent,
  pickNavbarComponent,
  pickLogoComponent,
  pickLayoutComponent,
  pickSidebarComponent,
  pickActiveToolLayoutComponent,
} from './picks'

/**
 * @internal
 */
export function useToolMenuComponent(): ComponentType<Omit<ToolMenuProps, 'renderDefault'>> {
  return useMiddlewareComponents({
    defaultComponent: StudioToolMenu as ComponentType<Omit<ToolMenuProps, 'renderDefault'>>,
    pick: pickToolMenuComponent,
  })
}

/**
 * @internal
 */
export function useNavbarComponent(): ComponentType<Omit<NavbarProps, 'renderDefault'>> {
  return useMiddlewareComponents({
    defaultComponent: StudioNavbar as ComponentType<Omit<NavbarProps, 'renderDefault'>>,
    pick: pickNavbarComponent,
  })
}

/**
 * @internal
 * @deprecated Use `useLogoMarkComponent` instead.
 */
export function useLogoComponent(): ComponentType<Omit<LogoProps, 'renderDefault'>> {
  return useMiddlewareComponents({
    defaultComponent: StudioLogo as ComponentType<Omit<LogoProps, 'renderDefault'>>,
    pick: pickLogoComponent,
  })
}

/**
 * @internal
 */
export function useLayoutComponent(): ComponentType<Omit<LayoutProps, 'renderDefault'>> {
  return useMiddlewareComponents({
    defaultComponent: StudioLayoutComponent as ComponentType<Omit<LayoutProps, 'renderDefault'>>,
    pick: pickLayoutComponent,
  })
}

/**
 * @internal
 */
export function useActiveToolLayoutComponent(): ComponentType<
  Omit<ActiveToolLayoutProps, 'renderDefault'>
> {
  return useMiddlewareComponents({
    defaultComponent: StudioActiveToolLayout as ComponentType<
      Omit<ActiveToolLayoutProps, 'renderDefault'>
    >,
    pick: pickActiveToolLayoutComponent,
  })
}
