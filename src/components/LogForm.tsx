import React, { useState, useEffect } from 'react';
import { LogEntry, FieldSuggestionsMap } from '../types';
import { SuggestionInput } from './SuggestionInput';

import { ArrowLeft } from 'lucide-react';

function formatEntryDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface LogFormProps {
  initialData?: LogEntry | null;
  nextLogNo: number;
  suggestions: FieldSuggestionsMap;
  onSave: (entry: LogEntry, andCreateAnother?: boolean) => void;
  onCancel: () => void;
}

export const LogForm: React.FC<LogFormProps> = ({
  initialData,
  nextLogNo,
  suggestions,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState<Partial<LogEntry>>({
    logNo: initialData ? initialData.logNo : nextLogNo,
    date: initialData ? initialData.date : formatEntryDate(new Date()),
    resellerName: initialData?.resellerName || '',
    callerPhone: initialData?.callerPhone || '',
    requestType: initialData?.requestType || 'New User ID',
    customerName: initialData?.customerName || '',
    nmsId: initialData?.nmsId || '',
    issueFound: initialData?.issueFound || '',
    missingWrongDetails: initialData?.missingWrongDetails || '',
    actionTaken: initialData?.actionTaken || '',
    reasonForAction: initialData?.reasonForAction || '',
    resellerInformed: initialData?.resellerInformed || 'Yes - phone',
    followUpNeeded: initialData?.followUpNeeded || 'Yes',
    status: initialData?.status || 'Pending - waiting for reseller',
    supervisorInformed: initialData?.supervisorInformed || 'I informed my superiors',
    remarks: initialData?.remarks || '',
    mac: initialData?.mac || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData((prev) => ({
        ...prev,
        logNo: nextLogNo,
        date: prev.date || formatEntryDate(new Date()),
      }));
    }
  }, [initialData, nextLogNo]);

  const updateField = (field: keyof LogEntry, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent, andCreateAnother = false) => {
    e.preventDefault();

    const finalizedEntry: LogEntry = {
      id: initialData?.id || `log-${Date.now()}`,
      logNo: formData.logNo || nextLogNo,
      date: formData.date?.trim() || formatEntryDate(new Date()),
      resellerName: formData.resellerName?.trim() || '',
      callerPhone: formData.callerPhone?.trim() || '',
      requestType: formData.requestType?.trim() || 'New User ID',
      customerName: formData.customerName?.trim() || '',
      nmsId: formData.nmsId?.trim() || '',
      issueFound: formData.issueFound?.trim() || '',
      missingWrongDetails: formData.missingWrongDetails?.trim() || '',
      actionTaken: formData.actionTaken?.trim() || '',
      reasonForAction: formData.reasonForAction?.trim() || '',
      resellerInformed: formData.resellerInformed?.trim() || '',
      followUpNeeded: formData.followUpNeeded?.trim() || '',
      status: formData.status?.trim() || 'Pending - waiting for reseller',
      supervisorInformed: formData.supervisorInformed?.trim() || '',
      remarks: formData.remarks?.trim() || '',
      mac: formData.mac?.trim() || '',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: initialData?.createdBy,
      updatedBy: initialData?.updatedBy,
      history: initialData?.history,
    };

    onSave(finalizedEntry, andCreateAnother);

    if (andCreateAnother) {
      setFormData((prev) => ({
        logNo: Number(prev.logNo || nextLogNo) + 1,
        date: formatEntryDate(new Date()),
        resellerName: prev.resellerName || '',
        callerPhone: prev.callerPhone || '',
        requestType: prev.requestType || 'New User ID',
        customerName: '',
        nmsId: '',
        issueFound: '',
        missingWrongDetails: '',
        actionTaken: '',
        reasonForAction: '',
        resellerInformed: prev.resellerInformed || 'Yes - phone',
        followUpNeeded: 'Yes',
        status: 'Pending - waiting for reseller',
        supervisorInformed: prev.supervisorInformed || 'I informed my superiors',
        remarks: '',
        mac: '',
      }));
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="w-full space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900">
            {isEditing ? `Edit Log #${formData.logNo}` : 'New Reseller Request Log'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Save & Next
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand-800 hover:bg-brand-900 rounded transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Log No & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Log No. <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.logNo ?? ''}
              onChange={(e) => updateField('logNo', parseInt(e.target.value, 10) || 1)}
              required
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded font-mono focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Date <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => updateField('date', formatEntryDate(new Date()))}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                Today
              </button>
            </div>
            <input
              type="text"
              value={formData.date || ''}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="e.g. 01 Oct 2026"
              required
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/20"
            />
          </div>
        </div>

        {/* Row 2: Reseller, Phone, Request Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
          <SuggestionInput
            name="resellerName"
            label="Reseller Name"
            value={formData.resellerName || ''}
            onChange={(val) => updateField('resellerName', val)}
            suggestions={suggestions.resellerName}
            placeholder="e.g. Shabul- Balaganj"
            required
          />

          <SuggestionInput
            name="callerPhone"
            label="Caller Phone"
            type="tel"
            value={formData.callerPhone || ''}
            onChange={(val) => updateField('callerPhone', val)}
            suggestions={suggestions.callerPhone}
            placeholder="e.g. +880 1680-945894"
          />

          <SuggestionInput
            name="requestType"
            label="Request Type"
            value={formData.requestType || ''}
            onChange={(val) => updateField('requestType', val)}
            suggestions={suggestions.requestType}
            placeholder="e.g. New User ID"
            required
          />
        </div>

        {/* Row 3: Customer, Issue, Missing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <SuggestionInput
            name="customerName"
            label="Customer Name"
            value={formData.customerName || ''}
            onChange={(val) => updateField('customerName', val)}
            suggestions={suggestions.customerName}
            placeholder="e.g. Hasampur Govt. Primary School"
            required
          />

          <SuggestionInput
            name="nmsId"
            label="NMS ID / Customer ID"
            value={formData.nmsId || ''}
            onChange={(val) => updateField('nmsId', val)}
            suggestions={suggestions.nmsId}
            placeholder="e.g. 100245"
          />

          <SuggestionInput
            name="issueFound"
            label="Issue Found"
            value={formData.issueFound || ''}
            onChange={(val) => updateField('issueFound', val)}
            suggestions={suggestions.issueFound}
            placeholder="e.g. Same router at two institute"
            isTextarea
            rows={2}
          />

          <SuggestionInput
            name="missingWrongDetails"
            label="Missing / Wrong Details"
            value={formData.missingWrongDetails || ''}
            onChange={(val) => updateField('missingWrongDetails', val)}
            suggestions={suggestions.missingWrongDetails}
            placeholder="e.g. They previously used the same router in Radhakona Govt. Primary School"
            isTextarea
            rows={2}
          />
        </div>

        {/* Row 4: Action Taken & Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          <SuggestionInput
            name="actionTaken"
            label="Action Taken"
            value={formData.actionTaken || ''}
            onChange={(val) => updateField('actionTaken', val)}
            suggestions={suggestions.actionTaken}
            placeholder="e.g. Provided the id/form as requested but kept nms entry on hold"
            isTextarea
            rows={3}
          />

          <SuggestionInput
            name="reasonForAction"
            label="REASON for Action (why I did it)"
            value={formData.reasonForAction || ''}
            onChange={(val) => updateField('reasonForAction', val)}
            suggestions={suggestions.reasonForAction}
            placeholder="e.g. I did not entry this school in nms because nms doesn't allow two school with same router."
            isTextarea
            rows={3}
          />
        </div>

        {/* Row 5: Informed, Follow-up, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
          <SuggestionInput
            name="resellerInformed"
            label="Reseller Informed?"
            value={formData.resellerInformed || ''}
            onChange={(val) => updateField('resellerInformed', val)}
            suggestions={suggestions.resellerInformed}
            placeholder="e.g. Yes - phone"
          />

          <SuggestionInput
            name="followUpNeeded"
            label="Follow-up Needed?"
            value={formData.followUpNeeded || ''}
            onChange={(val) => updateField('followUpNeeded', val)}
            suggestions={suggestions.followUpNeeded}
            placeholder="e.g. Yes"
          />

          <SuggestionInput
            name="status"
            label="Status"
            value={formData.status || ''}
            onChange={(val) => updateField('status', val)}
            suggestions={suggestions.status}
            placeholder="e.g. Pending - waiting for reseller"
            required
          />
        </div>

        {/* Row 6: Supervisor, MAC, Remarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SuggestionInput
            name="supervisorInformed"
            label="Supervisor Informed / Approved By"
            value={formData.supervisorInformed || ''}
            onChange={(val) => updateField('supervisorInformed', val)}
            suggestions={suggestions.supervisorInformed}
            placeholder="e.g. I informed my superiors"
          />

          <SuggestionInput
            name="mac"
            label="MAC Address"
            value={formData.mac || ''}
            onChange={(val) => updateField('mac', val)}
            suggestions={suggestions.mac}
            placeholder="e.g. 20:23:51:78:49:F4"
            autoFormatMac
          />

          <div className="sm:col-span-2">
            <SuggestionInput
              name="remarks"
              label="Remarks"
              value={formData.remarks || ''}
              onChange={(val) => updateField('remarks', val)}
              suggestions={suggestions.remarks}
              placeholder="e.g. Reseller said Radhakona Govt. Primary School is not using the network or the router anymore..."
              isTextarea
              rows={2}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
