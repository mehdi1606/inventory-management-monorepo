package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.QualityControlRequest;
import com.stock.qualityservice.dto.request.InspectionCompleteRequest;
import com.stock.qualityservice.dto.request.BulkInspectionRequest;
import com.stock.qualityservice.dto.request.QualityControlFilterRequest;
import com.stock.qualityservice.dto.response.QualityControlResponse;
import com.stock.qualityservice.dto.response.InspectionSummaryResponse;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QCType;

import java.time.LocalDateTime;
import java.util.List;

public interface QualityControlService {

    QualityControlResponse createInspection(QualityControlRequest request);

    List<QualityControlResponse> createBulkInspections(BulkInspectionRequest request);

    QualityControlResponse updateInspection(String id, QualityControlRequest request);

    QualityControlResponse getInspectionById(String id);

    QualityControlResponse getInspectionByNumber(String inspectionNumber);

    List<QualityControlResponse> getAllInspections();

    List<QualityControlResponse> getInspectionsByItemId(String itemId);

    List<QualityControlResponse> getInspectionsByLotId(String lotId);

    List<QualityControlResponse> getInspectionsByStatus(QCStatus status);

    List<QualityControlResponse> getInspectionsByType(QCType type);

    List<QualityControlResponse> getInspectionsByInspector(String inspectorId);

    List<QualityControlResponse> getPendingInspections();

    List<QualityControlResponse> getInProgressInspections();

    List<QualityControlResponse> getInspectorActiveInspections(String inspectorId);

    QualityControlResponse startInspection(String id);

    QualityControlResponse completeInspection(String id, InspectionCompleteRequest request);

    QualityControlResponse approveInspection(String id, String approvedBy);

    void deleteInspection(String id);

    List<QualityControlResponse> filterInspections(QualityControlFilterRequest filter);

    InspectionSummaryResponse getInspectionSummary();

    InspectionSummaryResponse getInspectionSummaryByDateRange(LocalDateTime startDate, LocalDateTime endDate);
}