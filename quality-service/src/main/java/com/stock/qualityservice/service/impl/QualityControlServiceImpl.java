package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.QualityControlRequest;
import com.stock.qualityservice.dto.request.InspectionCompleteRequest;
import com.stock.qualityservice.dto.request.BulkInspectionRequest;
import com.stock.qualityservice.dto.request.QualityControlFilterRequest;
import com.stock.qualityservice.dto.request.InspectionResultRequest;
import com.stock.qualityservice.dto.response.QualityControlResponse;
import com.stock.qualityservice.dto.response.InspectionSummaryResponse;
import com.stock.qualityservice.dto.response.InspectionResultResponse;
import com.stock.qualityservice.entity.QualityControl;
import com.stock.qualityservice.entity.InspectionResult;
import com.stock.qualityservice.entity.QCStatus;
import com.stock.qualityservice.entity.QCType;
import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.exception.*;
import com.stock.qualityservice.repository.QualityControlRepository;
import com.stock.qualityservice.repository.InspectionResultRepository;
import com.stock.qualityservice.service.QualityControlService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QualityControlServiceImpl implements QualityControlService {

    private final QualityControlRepository qualityControlRepository;
    private final InspectionResultRepository inspectionResultRepository;

    @Override
    public QualityControlResponse createInspection(QualityControlRequest request) {
        log.info("Creating inspection for item ID: {}", request.getItemId());

        // Check for duplicate active inspection
        List<QCStatus> activeStatuses = Arrays.asList(QCStatus.PENDING, QCStatus.IN_PROGRESS);
        if (qualityControlRepository.existsByItemIdAndLotIdAndStatusIn(
                request.getItemId(), request.getLotId(), activeStatuses)) {
            throw new DuplicateInspectionException(request.getItemId(), request.getLotId());
        }

        QualityControl inspection = mapToEntity(request);
        inspection.setInspectionNumber(generateInspectionNumber());
        QualityControl savedInspection = qualityControlRepository.save(inspection);

        log.info("Inspection created successfully with ID: {}", savedInspection.getId());
        return mapToResponse(savedInspection);
    }

    @Override
    public List<QualityControlResponse> createBulkInspections(BulkInspectionRequest request) {
        log.info("Creating bulk inspections for {} items", request.getItemIds().size());

        List<QualityControl> inspections = new ArrayList<>();

        for (String itemId : request.getItemIds()) {
            QualityControl inspection = new QualityControl();
            inspection.setInspectionNumber(generateInspectionNumber());
            inspection.setItemId(itemId);
            inspection.setQuantityInspected(0.0); // To be filled later
            inspection.setInspectionType(request.getInspectionType());
            inspection.setStatus(QCStatus.PENDING);
            inspection.setQualityProfileId(request.getQualityProfileId());
            inspection.setSamplingPlanId(request.getSamplingPlanId());
            inspection.setInspectorId(request.getInspectorId());
            inspection.setInspectionLocationId(request.getInspectionLocationId());
            inspection.setScheduledDate(request.getScheduledDate());

            inspections.add(inspection);
        }

        List<QualityControl> savedInspections = qualityControlRepository.saveAll(inspections);

        log.info("Bulk inspections created successfully: {} inspections", savedInspections.size());
        return savedInspections.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QualityControlResponse updateInspection(String id, QualityControlRequest request) {
        log.info("Updating inspection ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        // Check if inspection is already completed
        if (inspection.getStatus() == QCStatus.PASSED || inspection.getStatus() == QCStatus.FAILED) {
            throw new InspectionAlreadyCompletedException(id);
        }

        updateEntityFromRequest(inspection, request);
        QualityControl updatedInspection = qualityControlRepository.save(inspection);

        log.info("Inspection updated successfully: {}", id);
        return mapToResponse(updatedInspection);
    }

    @Override
    @Transactional(readOnly = true)
    public QualityControlResponse getInspectionById(String id) {
        log.info("Fetching inspection by ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        return mapToResponse(inspection);
    }

    @Override
    @Transactional(readOnly = true)
    public QualityControlResponse getInspectionByNumber(String inspectionNumber) {
        log.info("Fetching inspection by number: {}", inspectionNumber);

        QualityControl inspection = qualityControlRepository.findByInspectionNumber(inspectionNumber)
                .orElseThrow(() -> new InspectionNotFoundException("inspectionNumber", inspectionNumber));

        return mapToResponse(inspection);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getAllInspections() {
        log.info("Fetching all inspections");

        return qualityControlRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectionsByItemId(String itemId) {
        log.info("Fetching inspections for item ID: {}", itemId);

        return qualityControlRepository.findByItemId(itemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectionsByLotId(String lotId) {
        log.info("Fetching inspections for lot ID: {}", lotId);

        return qualityControlRepository.findByLotId(lotId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectionsByStatus(QCStatus status) {
        log.info("Fetching inspections by status: {}", status);

        return qualityControlRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectionsByType(QCType type) {
        log.info("Fetching inspections by type: {}", type);

        return qualityControlRepository.findByInspectionType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectionsByInspector(String inspectorId) {
        log.info("Fetching inspections for inspector ID: {}", inspectorId);

        return qualityControlRepository.findByInspectorId(inspectorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getPendingInspections() {
        log.info("Fetching pending inspections");

        return qualityControlRepository.findAllPendingInspections().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInProgressInspections() {
        log.info("Fetching in-progress inspections");

        return qualityControlRepository.findAllInProgressInspections().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> getInspectorActiveInspections(String inspectorId) {
        log.info("Fetching active inspections for inspector ID: {}", inspectorId);

        return qualityControlRepository.findActiveInspectionsByInspector(inspectorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QualityControlResponse startInspection(String id) {
        log.info("Starting inspection ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        // Validate state
        if (inspection.getStatus() != QCStatus.PENDING) {
            throw new InvalidInspectionStateException(id, inspection.getStatus(), "start");
        }

        inspection.setStatus(QCStatus.IN_PROGRESS);
        inspection.setStartTime(LocalDateTime.now());

        QualityControl updatedInspection = qualityControlRepository.save(inspection);

        log.info("Inspection started successfully: {}", id);
        return mapToResponse(updatedInspection);
    }

    @Override
    public QualityControlResponse completeInspection(String id, InspectionCompleteRequest request) {
        log.info("Completing inspection ID: {}", id);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        // Validate state
        if (inspection.getStatus() != QCStatus.IN_PROGRESS) {
            throw new InvalidInspectionStateException(id, inspection.getStatus(), "complete");
        }

        inspection.setStatus(request.getDisposition() == Disposition.ACCEPT ? QCStatus.PASSED : QCStatus.FAILED);
        inspection.setDisposition(request.getDisposition());
        inspection.setPassedQuantity(request.getPassedQuantity());
        inspection.setFailedQuantity(request.getFailedQuantity());
        inspection.setInspectorNotes(request.getInspectorNotes());
        inspection.setCorrectiveAction(request.getCorrectiveAction());
        inspection.setEndTime(LocalDateTime.now());

        // Calculate defect metrics
        if (request.getFailedQuantity() != null && inspection.getQuantityInspected() != null) {
            int defectCount = request.getFailedQuantity().intValue();
            double defectRate = (request.getFailedQuantity() / inspection.getQuantityInspected()) * 100;
            inspection.setDefectCount(defectCount);
            inspection.setDefectRate(defectRate);
        }

        QualityControl completedInspection = qualityControlRepository.save(inspection);

        // Save inspection results
        if (request.getInspectionResults() != null && !request.getInspectionResults().isEmpty()) {
            saveInspectionResults(completedInspection, request.getInspectionResults());
        }

        log.info("Inspection completed successfully: {}", id);
        // TODO: Publish QualityInspectionCompletedEvent
        return mapToResponse(completedInspection);
    }

    @Override
    public QualityControlResponse approveInspection(String id, String approvedBy) {
        log.info("Approving inspection ID: {} by: {}", id, approvedBy);

        QualityControl inspection = qualityControlRepository.findById(id)
                .orElseThrow(() -> new InspectionNotFoundException(id));

        // Validate state
        if (inspection.getStatus() != QCStatus.PASSED && inspection.getStatus() != QCStatus.FAILED) {
            throw new InvalidInspectionStateException(id, inspection.getStatus(), "approve");
        }

        inspection.setApprovedBy(approvedBy);
        inspection.setApprovedAt(LocalDateTime.now());

        QualityControl approvedInspection = qualityControlRepository.save(inspection);

        log.info("Inspection approved successfully: {}", id);
        // TODO: Publish ItemApprovedEvent or ItemRejectedEvent based on disposition
        return mapToResponse(approvedInspection);
    }

    @Override
    public void deleteInspection(String id) {
        log.info("Deleting inspection ID: {}", id);

        if (!qualityControlRepository.existsById(id)) {
            throw new InspectionNotFoundException(id);
        }

        qualityControlRepository.deleteById(id);
        log.info("Inspection deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QualityControlResponse> filterInspections(QualityControlFilterRequest filter) {
        log.info("Filtering inspections with criteria");

        // TODO: Implement dynamic filtering based on filter criteria
        // For now, returning all
        return getAllInspections();
    }

    @Override
    @Transactional(readOnly = true)
    public InspectionSummaryResponse getInspectionSummary() {
        log.info("Generating inspection summary");

        InspectionSummaryResponse summary = new InspectionSummaryResponse();

        summary.setTotalInspections(qualityControlRepository.count());
        summary.setPassedInspections(qualityControlRepository.countByDisposition(Disposition.ACCEPT));
        summary.setFailedInspections(qualityControlRepository.countByDisposition(Disposition.REJECT));
        summary.setPendingInspections(qualityControlRepository.countByStatus(QCStatus.PENDING));
        summary.setQuarantinedItems(qualityControlRepository.countByStatus(QCStatus.QUARANTINED));

        // Calculate pass rate
        if (summary.getTotalInspections() > 0) {
            double passRate = (summary.getPassedInspections().doubleValue() / summary.getTotalInspections()) * 100;
            summary.setOverallPassRate(passRate);
        }

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public InspectionSummaryResponse getInspectionSummaryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Generating inspection summary for date range: {} to {}", startDate, endDate);

        InspectionSummaryResponse summary = new InspectionSummaryResponse();

        summary.setPassedInspections(qualityControlRepository.countPassedInspections(startDate, endDate));
        summary.setFailedInspections(qualityControlRepository.countFailedInspections(startDate, endDate));
        summary.setAverageDefectRate(qualityControlRepository.getAverageDefectRate(startDate, endDate));
        summary.setTotalInspections(summary.getPassedInspections() + summary.getFailedInspections());

        // Calculate pass rate
        if (summary.getTotalInspections() > 0) {
            double passRate = (summary.getPassedInspections().doubleValue() / summary.getTotalInspections()) * 100;
            summary.setOverallPassRate(passRate);
        }

        return summary;
    }

    // Helper methods
    private String generateInspectionNumber() {
        return "INS-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void saveInspectionResults(QualityControl inspection, List<InspectionResultRequest> resultRequests) {
        List<InspectionResult> results = resultRequests.stream()
                .map(request -> {
                    InspectionResult result = new InspectionResult();
                    result.setQualityControl(inspection);
                    result.setTestParameter(request.getTestParameter());
                    result.setExpectedValue(request.getExpectedValue());
                    result.setActualValue(request.getActualValue());
                    result.setUnitOfMeasure(request.getUnitOfMeasure());
                    result.setMinValue(request.getMinValue());
                    result.setMaxValue(request.getMaxValue());
                    result.setIsPassed(request.getIsPassed());
                    result.setDefectType(request.getDefectType());
                    result.setDefectSeverity(request.getDefectSeverity());
                    result.setRemarks(request.getRemarks());
                    result.setSequenceOrder(request.getSequenceOrder());
                    return result;
                })
                .collect(Collectors.toList());

        inspectionResultRepository.saveAll(results);
    }

    private QualityControl mapToEntity(QualityControlRequest request) {
        QualityControl inspection = new QualityControl();
        inspection.setItemId(request.getItemId());
        inspection.setLotId(request.getLotId());
        inspection.setSerialNumber(request.getSerialNumber());
        inspection.setQuantityInspected(request.getQuantityInspected());
        inspection.setInspectionType(request.getInspectionType());
        inspection.setStatus(QCStatus.PENDING);
        inspection.setQualityProfileId(request.getQualityProfileId());
        inspection.setSamplingPlanId(request.getSamplingPlanId());
        inspection.setInspectorId(request.getInspectorId());
        inspection.setInspectionLocationId(request.getInspectionLocationId());
        inspection.setScheduledDate(request.getScheduledDate());
        inspection.setQuarantineId(request.getQuarantineId());
        return inspection;
    }

    private void updateEntityFromRequest(QualityControl inspection, QualityControlRequest request) {
        inspection.setQuantityInspected(request.getQuantityInspected());
        inspection.setInspectionType(request.getInspectionType());
        inspection.setQualityProfileId(request.getQualityProfileId());
        inspection.setSamplingPlanId(request.getSamplingPlanId());
        inspection.setInspectorId(request.getInspectorId());
        inspection.setInspectionLocationId(request.getInspectionLocationId());
        inspection.setScheduledDate(request.getScheduledDate());
        inspection.setQuarantineId(request.getQuarantineId());
    }

    private QualityControlResponse mapToResponse(QualityControl inspection) {
        QualityControlResponse response = new QualityControlResponse();
        response.setId(inspection.getId());
        response.setInspectionNumber(inspection.getInspectionNumber());
        response.setItemId(inspection.getItemId());
        response.setLotId(inspection.getLotId());
        response.setSerialNumber(inspection.getSerialNumber());
        response.setQuantityInspected(inspection.getQuantityInspected());
        response.setInspectionType(inspection.getInspectionType());
        response.setStatus(inspection.getStatus());
        response.setQualityProfileId(inspection.getQualityProfileId());
        response.setSamplingPlanId(inspection.getSamplingPlanId());
        response.setInspectorId(inspection.getInspectorId());
        response.setInspectionLocationId(inspection.getInspectionLocationId());
        response.setScheduledDate(inspection.getScheduledDate());
        response.setStartTime(inspection.getStartTime());
        response.setEndTime(inspection.getEndTime());
        response.setDisposition(inspection.getDisposition());
        response.setPassedQuantity(inspection.getPassedQuantity());
        response.setFailedQuantity(inspection.getFailedQuantity());
        response.setDefectCount(inspection.getDefectCount());
        response.setDefectRate(inspection.getDefectRate());
        response.setInspectorNotes(inspection.getInspectorNotes());
        response.setCorrectiveAction(inspection.getCorrectiveAction());
        response.setQuarantineId(inspection.getQuarantineId());
        response.setApprovedBy(inspection.getApprovedBy());
        response.setApprovedAt(inspection.getApprovedAt());
        response.setCreatedAt(inspection.getCreatedAt());
        response.setUpdatedAt(inspection.getUpdatedAt());
        response.setCreatedBy(inspection.getCreatedBy());
        response.setUpdatedBy(inspection.getUpdatedBy());

        // Map inspection results
        if (inspection.getInspectionResults() != null && !inspection.getInspectionResults().isEmpty()) {
            List<InspectionResultResponse> resultResponses = inspection.getInspectionResults().stream()
                    .map(this::mapResultToResponse)
                    .collect(Collectors.toList());
            response.setInspectionResults(resultResponses);
        }

        return response;
    }

    private InspectionResultResponse mapResultToResponse(InspectionResult result) {
        InspectionResultResponse response = new InspectionResultResponse();
        response.setId(result.getId());
        response.setQualityControlId(result.getQualityControl().getId());
        response.setTestParameter(result.getTestParameter());
        response.setExpectedValue(result.getExpectedValue());
        response.setActualValue(result.getActualValue());
        response.setUnitOfMeasure(result.getUnitOfMeasure());
        response.setMinValue(result.getMinValue());
        response.setMaxValue(result.getMaxValue());
        response.setIsPassed(result.getIsPassed());
        response.setDefectType(result.getDefectType());
        response.setDefectSeverity(result.getDefectSeverity());
        response.setRemarks(result.getRemarks());
        response.setSequenceOrder(result.getSequenceOrder());
        response.setCreatedAt(result.getCreatedAt());
        return response;
    }
}