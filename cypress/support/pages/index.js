// cypress/support/pages/index.js
//
// Central registry: maps module_key (from roles-permissions.json) to page object.
// Role spec files look up pages through getPage() only.
//
// URL-to-module_key mapping confirmed from live observation (2026-04-22) for
// Reception modules; remaining URLs derived from application route structure.

import dashboard from './DashboardPage';
import sampleReception from './SampleReceptionPage';
import sampleReceipt from './SampleReceiptPage';
import clientProfile from './ClientProfilePage';
import mailer from './MailerPage';
import ticket from './TicketPage';
import indent from './IndentPage';

// Master Library
import analyteMaster from './AnalyteMasterPage';
import stpMaster from './StpMasterPage';
import genericMaster from './GenericMasterPage';

// Sample Management
import bookSample from './BookSamplePage';
import productMaster from './ProductMasterPage';
import priceList from './PriceListPage';
import trfMasterTable from './TrfMasterTablePage';
import barCodeGeneration from './BarCodeGenerationPage';
import archiveSamples from './ArchiveSamplesPage';
import sampleDiscarded from './SampleDiscardedPage';
import sampleDiscardReport from './SampleDiscardReportPage';

// Quotation & Purchase
import quotation from './QuotationPage';
import purchaseOrder from './PurchaseOrderPage';
import clientPO from './ClientPOPage';
import creditApproval from './CreditApprovalPage';

// DMS / Method
import methodUpload from './MethodUploadPage';
import methodValidation from './MethodValidationPage';
import methodDevelopment from './MethodDevelopmentPage';

// QDMS
import nabl from './NablPage';
import deptStpQa from './DeptStpQaPage';
import deptSop from './DeptSopPage';
import mapStpMethod from './MapStpMethodPage';

// Equipment
import equipmentPm from './EquipmentPmPage';
import equipmentOnOff from './EquipmentOnOffPage';
import equipmentAssign from './EquipmentAssignPage';
import equipmentTransfer from './EquipmentTransferPage';

// Reports & COC
import myPendingTest from './MyPendingTestPage';
import myCompleteTest from './MyCompleteTestPage';
import reportCompilation from './ReportCompilationPage';
import reportPrint from './ReportPrintPage';
import reportFinalUpload from './ReportFinalUploadPage';
import reportFormB from './ReportFormBPage';
import reportSampleUpdation from './ReportSampleUpdationPage';
import reportTracking from './ReportTrackingPage';
import reportReview from './ReportReviewPage';
import reportSign from './ReportSignPage';
import reportDispatch from './ReportDispatchPage';

// Quality Management
import oosAnswer from './OosAnswerPage';
import oosQuestion from './OosQuestionPage';

// Invoice
import invoice from './InvoicePage';

const MODULE_PAGES = {
  // ── Reception ────────────────────────────────────────────────────────────
  'dashboard': dashboard,
  'sample_managemnet_reception_recieve_sample': sampleReception,
  'sample_managemnet_received_sample': sampleReceipt,
  'customer_relation_management_client_profile': clientProfile,
  'support_mailer': mailer,
  'support_ticket': ticket,
  'purchase_indent_indent': indent,

  // ── Sample Management (extended) ────────────────────────────────────────────
  'sample_management_barcode_generation': barCodeGeneration,
  'sample_management_archive_samples': archiveSamples,
  'sample_management_sample_discarded': sampleDiscarded,
  'sample_management_sample_discard_report': sampleDiscardReport,

  // ── Master Library ───────────────────────────────────────────────────────
  'masters_library_analyte_master': analyteMaster,
  'masters_library_stp_master': stpMaster,
  'masters_library_generic_master': genericMaster,

  // ── Sample Management ─────────────────────────────────────────────────────
  'sample_management_book_sample': bookSample,
  'sample_management_product_master': productMaster,
  'sample_management_price_list': priceList,
  'sample_management_trf_master_table': trfMasterTable,

  // ── Quotation & Purchase ──────────────────────────────────────────────────
  'quotation_pricing_quotation': quotation,
  'purchase_indent_purchase_order': purchaseOrder,
  'crm_client_po': clientPO,
  'crm_credit_approval': creditApproval,

  // ── DMS / Method ──────────────────────────────────────────────────────────
  'dms_method_upload': methodUpload,
  'quality_method_validation': methodValidation,
  'quality_method_development': methodDevelopment,

  // ── QDMS ──────────────────────────────────────────────────────────────────
  'qdms_nabl': nabl,
  'qdms_department_stp_qa': deptStpQa,
  'qdms_stp_qa_management': deptStpQa,   // same page, different role permissions
  'qdms_department_sop': deptSop,
  'qdms_sop_management': deptSop,     // same page, different role permissions
  'quality_map_stp_method': mapStpMethod,

  // ── Equipment ─────────────────────────────────────────────────────────────
  'equipment_management_equipment_pm': equipmentPm,
  'equipment_management_equipment_on_off': equipmentOnOff,
  'equipment_management_equipment_assign': equipmentAssign,
  'equipment_management_equipment_transfer': equipmentTransfer,

  // ── Reports & COC ─────────────────────────────────────────────────────────
  'reports_coc_my_pending_test': myPendingTest,
  'reports_coc_my_complete_test': myCompleteTest,
  'reports_compilation': reportCompilation,
  'reports_print': reportPrint,
  'reports_final_upload': reportFinalUpload,
  'reports_form_b': reportFormB,
  'reports_sample_updation': reportSampleUpdation,
  'reports_coc_support_tracking': reportTracking,
  'reports_tracking': reportTracking,
  'reports_review': reportReview,
  'reports_sign': reportSign,
  'reports_dispatch': reportDispatch,

  // ── Quality Management ────────────────────────────────────────────────────
  'quality_management_oos_answer': oosAnswer,
  'quality_management_oos_question': oosQuestion,

  // ── Invoice ───────────────────────────────────────────────────────────────
  'invoice_manage': invoice,
};

export function getPage(moduleKey) {
  return MODULE_PAGES[moduleKey] || null;
}

export function listUnmappedModules(requiredKeys) {
  return requiredKeys.filter(k => !MODULE_PAGES[k]);
}
