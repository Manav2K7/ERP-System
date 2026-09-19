import PropTypes from "prop-types";
import Chip from "@mui/material/Chip";
import { formatEnum } from "../../utils/formatters";

/**
 * THE one status chip for every status-workflow module (F3+). One color map
 * for all enums; never a second badge component.
 */
const STATUS_COLOR = {
  PENDING: "warning",
  APPROVED: "info",
  DISPATCHED: "success",
  ORDERED: "info",
  PARTIALLY_RECEIVED: "warning",
  RECEIVED: "success",
  PAID: "success",
  CANCELLED: "default",
};

export default function StatusChip({ status }) {
  if (!status) return "—";
  return <Chip size="small" color={STATUS_COLOR[status] || "default"} label={formatEnum(status)} />;
}

StatusChip.propTypes = { status: PropTypes.string };
