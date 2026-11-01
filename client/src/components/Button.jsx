import { Link } from 'react-router';

export default function Button({ variant = 'primary', size, to, href, className = '', children, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim();
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>{children}</a>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
