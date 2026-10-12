import { Link } from 'react-router';

/**
 * The site's one button. Looks come from the .btn classes in index.css (pill, 44px tap target,
 * focus ring); this picks the right element:
 *   to="/products"        an in-site link
 *   href="https://…"      an outside link, opened in a new tab
 *   neither               a <button>
 * variant: primary (one per section) · secondary · ghost · whatsapp. size: "sm" for cards.
 */
export default function Button({ variant = 'primary', size, to, href, className = '', children, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
