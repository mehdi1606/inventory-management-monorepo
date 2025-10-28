package com.stock.qualityservice.service.impl;

import com.stock.qualityservice.dto.request.QuarantineRequest;
import com.stock.qualityservice.dto.request.QuarantineReleaseRequest;
import com.stock.qualityservice.dto.request.QuarantineFilterRequest;
import com.stock.qualityservice.dto.response.QuarantineResponse;
import com.stock.qualityservice.dto.response.QuarantineSummaryResponse;
import com.stock.qualityservice.entity.Quarantine;
import com.stock.qualityservice.entity.QuarantineStatus;
import com.stock.qualityservice.entity.Disposition;
import com.stock.qualityservice.exception.QuarantineNotFoundException;
import com.stock.qualityservice.exception.InvalidQuarantineStateException;
import com.stock.qualityservice.exception.DuplicateQuarantineException;
import com.stock.qualityservice.repository.QuarantineRepository;
import com.stock.qualityservice.service.QuarantineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuarantineServiceImpl implements QuarantineService {

    private final QuarantineRepository quarantineRepository;

    @Override
    public QuarantineResponse createQuarantine(QuarantineRequest request) {
        log.info("Creating quarantine for item ID: {}", request.getItemId());

        // Check for duplicate active quarantine
        List<QuarantineStatus> activeStatuses = Arrays.asList(QuarantineStatus.IN_PROCESS, QuarantineStatus.QUARANTINED);
        if (quarantineRepository.existsByItemIdAndLotIdAndStatusIn(
                request.getItemId(), request.getLotId(), activeStatuses)) {
            throw new DuplicateQuarantineException(request.getItemId(), request.getLotId());
        }

        Quarantine quarantine = mapToEntity(request);
        Quarantine savedQuarantine = quarantineRepository.save(quarantine);

        log.info("Quarantine created successfully with ID: {}", savedQuarantine.getId());
        // TODO: Publish QuarantineCreatedEvent
        return mapToResponse(savedQuarantine);
    }

    @Override
    public QuarantineResponse updateQuarantine(String id, QuarantineRequest request) {
        log.info("Updating quarantine ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        // Check if quarantine is already released
        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "update");
        }

        updateEntityFromRequest(quarantine, request);
        Quarantine updatedQuarantine = quarantineRepository.save(quarantine);

        log.info("Quarantine updated successfully: {}", id);
        return mapToResponse(updatedQuarantine);
    }

    @Override
    @Transactional(readOnly = true)
    public QuarantineResponse getQuarantineById(String id) {
        log.info("Fetching quarantine by ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        return mapToResponse(quarantine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getAllQuarantines() {
        log.info("Fetching all quarantines");

        return quarantineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByItemId(String itemId) {
        log.info("Fetching quarantines for item ID: {}", itemId);

        return quarantineRepository.findByItemId(itemId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByLotId(String lotId) {
        log.info("Fetching quarantines for lot ID: {}", lotId);

        return quarantineRepository.findByLotId(lotId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByStatus(QuarantineStatus status) {
        log.info("Fetching quarantines by status: {}", status);

        return quarantineRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getQuarantinesByInspector(String inspectorId) {
        log.info("Fetching quarantines for inspector ID: {}", inspectorId);

        return quarantineRepository.findByInspectorId(inspectorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> getOverdueQuarantines() {
        log.info("Fetching overdue quarantines");

        return quarantineRepository.findOverdueQuarantines(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuarantineResponse releaseQuarantine(String id, QuarantineReleaseRequest request) {
        log.info("Releasing quarantine ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        // Validate state
        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "release");
        }

        quarantine.setStatus(QuarantineStatus.RELEASED);
        quarantine.setDisposition(request.getDisposition());
        quarantine.setReleaseNotes(request.getReleaseNotes());
        quarantine.setActualReleaseDate(LocalDateTime.now());

        Quarantine releasedQuarantine = quarantineRepository.save(quarantine);

        log.info("Quarantine released successfully: {}", id);
        // TODO: Publish QuarantineReleasedEvent
        return mapToResponse(releasedQuarantine);
    }

    @Override
    public QuarantineResponse rejectQuarantine(String id, QuarantineReleaseRequest request) {
        log.info("Rejecting quarantine ID: {}", id);

        Quarantine quarantine = quarantineRepository.findById(id)
                .orElseThrow(() -> new QuarantineNotFoundException(id));

        // Validate state
        if (quarantine.getStatus() == QuarantineStatus.RELEASED) {
            throw new InvalidQuarantineStateException(id, quarantine.getStatus(), "reject");
        }

        quarantine.setStatus(QuarantineStatus.REJECTED);
        quarantine.setDisposition(Disposition.REJECT);
        quarantine.setReleaseNotes(request.getReleaseNotes());
        quarantine.setActualReleaseDate(LocalDateTime.now());

        Quarantine rejectedQuarantine = quarantineRepository.save(quarantine);

        log.info("Quarantine rejected successfully: {}", id);
        // TODO: Publish ItemRejectedEvent
        return mapToResponse(rejectedQuarantine);
    }

    @Override
    public void deleteQuarantine(String id) {
        log.info("Deleting quarantine ID: {}", id);

        if (!quarantineRepository.existsById(id)) {
            throw new QuarantineNotFoundException(id);
        }

        quarantineRepository.deleteById(id);
        log.info("Quarantine deleted successfully: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuarantineResponse> filterQuarantines(QuarantineFilterRequest filter) {
        log.info("Filtering quarantines with criteria");

        // TODO: Implement dynamic filtering based on filter criteria
        // For now, returning all
        return getAllQuarantines();
    }

    @Override
    @Transactional(readOnly = true)
    public QuarantineSummaryResponse getQuarantineSummary() {
        log.info("Generating quarantine summary");

        QuarantineSummaryResponse summary = new QuarantineSummaryResponse();

        summary.setTotalQuarantined(quarantineRepository.count());
        summary.setInProcess(quarantineRepository.countByStatus(QuarantineStatus.IN_PROCESS));
        summary.setReleased(quarantineRepository.countByStatus(QuarantineStatus.RELEASED));
        summary.setRejected(quarantineRepository.countByStatus(QuarantineStatus.REJECTED));
        summary.setTotalQuantityQuarantined(quarantineRepository.getTotalQuarantinedQuantity());
        summary.setOverdueQuarantines((long) quarantineRepository.findOverdueQuarantines(LocalDateTime.now()).size());

        return summary;
    }

    // Helper methods
    private Quarantine mapToEntity(QuarantineRequest request) {
        Quarantine quarantine = new Quarantine();
        quarantine.setItemId(request.getItemId());
        quarantine.setLotId(request.getLotId());
        quarantine.setSerialNumber(request.getSerialNumber());
        quarantine.setQuantity(request.getQuantity());
        quarantine.setLocationId(request.getLocationId());
        quarantine.setStatus(QuarantineStatus.IN_PROCESS);
        quarantine.setReason(request.getReason());
        quarantine.setInspectorId(request.getInspectorId());
        quarantine.setQualityProfileId(request.getQualityProfileId());
        quarantine.setExpectedReleaseDate(request.getExpectedReleaseDate());
        quarantine.setSeverity(request.getSeverity());
        quarantine.setQuarantineType(request.getQuarantineType());
        quarantine.setNotes(request.getNotes());
        return quarantine;
    }

    private void updateEntityFromRequest(Quarantine quarantine, QuarantineRequest request) {
        quarantine.setQuantity(request.getQuantity());
        quarantine.setLocationId(request.getLocationId());
        quarantine.setReason(request.getReason());
        quarantine.setInspectorId(request.getInspectorId());
        quarantine.setQualityProfileId(request.getQualityProfileId());
        quarantine.setExpectedReleaseDate(request.getExpectedReleaseDate());
        quarantine.setSeverity(request.getSeverity());
        quarantine.setNotes(request.getNotes());
    }

    private QuarantineResponse mapToResponse(Quarantine quarantine) {
        QuarantineResponse response = new QuarantineResponse();
        response.setId(quarantine.getId());
        response.setItemId(quarantine.getItemId());
        response.setLotId(quarantine.getLotId());
        response.setSerialNumber(quarantine.getSerialNumber());
        response.setQuantity(quarantine.getQuantity());
        response.setLocationId(quarantine.getLocationId());
        response.setStatus(quarantine.getStatus());
        response.setReason(quarantine.getReason());
        response.setInspectorId(quarantine.getInspectorId());
        response.setQualityProfileId(quarantine.getQualityProfileId());
        response.setEntryDate(quarantine.getEntryDate());
        response.setExpectedReleaseDate(quarantine.getExpectedReleaseDate());
        response.setActualReleaseDate(quarantine.getActualReleaseDate());
        response.setReleaseNotes(quarantine.getReleaseNotes());
        response.setDisposition(quarantine.getDisposition());
        response.setSeverity(quarantine.getSeverity());
        response.setQuarantineType(quarantine.getQuarantineType());
        response.setNotes(quarantine.getNotes());
        response.setCreatedAt(quarantine.getCreatedAt());
        response.setUpdatedAt(quarantine.getUpdatedAt());
        response.setCreatedBy(quarantine.getCreatedBy());
        response.setUpdatedBy(quarantine.getUpdatedBy());
        return response;
    }
}