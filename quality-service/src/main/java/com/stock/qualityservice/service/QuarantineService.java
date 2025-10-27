package com.stock.qualityservice.service;

import com.stock.qualityservice.dto.request.QuarantineRequest;
import com.stock.qualityservice.dto.request.QuarantineReleaseRequest;
import com.stock.qualityservice.dto.request.QuarantineFilterRequest;
import com.stock.qualityservice.dto.response.QuarantineResponse;
import com.stock.qualityservice.dto.response.QuarantineSummaryResponse;
import com.stock.qualityservice.entity.QuarantineStatus;

import java.util.List;

public interface QuarantineService {

    QuarantineResponse createQuarantine(QuarantineRequest request);

    QuarantineResponse updateQuarantine(String id, QuarantineRequest request);

    QuarantineResponse getQuarantineById(String id);

    List<QuarantineResponse> getAllQuarantines();

    List<QuarantineResponse> getQuarantinesByItemId(String itemId);

    List<QuarantineResponse> getQuarantinesByLotId(String lotId);

    List<QuarantineResponse> getQuarantinesByStatus(QuarantineStatus status);

    List<QuarantineResponse> getQuarantinesByInspector(String inspectorId);

    List<QuarantineResponse> getOverdueQuarantines();

    QuarantineResponse releaseQuarantine(String id, QuarantineReleaseRequest request);

    QuarantineResponse rejectQuarantine(String id, QuarantineReleaseRequest request);

    void deleteQuarantine(String id);

    List<QuarantineResponse> filterQuarantines(QuarantineFilterRequest filter);

    QuarantineSummaryResponse getQuarantineSummary();
}