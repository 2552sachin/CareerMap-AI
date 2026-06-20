import { type AnchorHTMLAttributes, forwardRef } from 'react'

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  external?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, external, children, ...rest },
  ref,
) {
  if (external || href.startsWith('http') || href.startsWith('#')) {
    return (
      <a
        ref={ref}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  )
})
