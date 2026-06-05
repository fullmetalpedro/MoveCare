import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./PageHeader.css";

interface PageHeaderProps {
  /** Primary page heading rendered as an `<h1>`. */
  title: string;
  /** Optional secondary descriptor rendered below the title. */
  subtitle?: string;
  /** Route path for the back-chevron `<button>`; omit to hide the button entirely. */
  backTo?: string;
  /** Optional content rendered in a right-aligned actions area (e.g. a primary `<Button>`). */
  children?: React.ReactNode;
}

/**
 * Reusable page-level header with an optional back-navigation button and a
 * right-aligned actions slot.
 *
 * @param props - {@link PageHeaderProps}
 * @returns A `<div>` with the title block on the left and an optional actions
 *   section on the right.
 *
 * @example
 * <PageHeader title="Pacientes" backTo="/" subtitle="12 ativos">
 *   <Button variant="primary" onClick={openModal}>Novo Paciente</Button>
 * </PageHeader>
 */
export default function PageHeader({ title, subtitle, backTo, children }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="page-header-left">
        {backTo && (
          <button className="back-btn" onClick={() => navigate(backTo)}>
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}
