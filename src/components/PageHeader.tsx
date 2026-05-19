import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./PageHeader.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  children?: React.ReactNode;
}

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
