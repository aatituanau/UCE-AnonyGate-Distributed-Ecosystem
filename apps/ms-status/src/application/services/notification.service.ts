import { Injectable, Logger } from '@nestjs/common';
import { CaseStatus } from '../../domain/entities/case-status.entity';
import { StatusGateway } from '../../infrastructure/adapters/inbound/websocket/status.gateway';
import { MqttAlertService } from '../../infrastructure/adapters/outbound/mqtt/mqtt-alert.service';

/**
 * Service to orchestrate real-time notifications.
 * Emits events to WebSockets and MQTT depending on urgency.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly statusGateway: StatusGateway,
    private readonly mqttAlertService: MqttAlertService,
  ) {}

  notifyNewComplaint(caseStatus: CaseStatus): void {
    this.logger.log(`Notify new complaint: ${caseStatus.complaintId}`);
    this.statusGateway.emitNewComplaint(caseStatus);
  }

  notifyStatusUpdate(caseStatus: CaseStatus, fromStatus: string): void {
    this.logger.log(`Notify status update: ${caseStatus.complaintId} (${fromStatus} -> ${caseStatus.status})`);
    this.statusGateway.emitStatusUpdate({
      ...caseStatus,
      fromStatus,
    });
  }

  notifyCriticalAlert(caseStatus: CaseStatus): void {
    this.logger.warn(`CRITICAL ALERT for complaint: ${caseStatus.complaintId}`);
    
    // Broadcast to web dashboard via WebSocket
    this.statusGateway.emitCriticalAlert(caseStatus);
    
    // Publish to MQTT for mobile app push notifications
    this.mqttAlertService.publishAlert({
      type: 'CRITICAL_ALERT',
      timestamp: new Date().toISOString(),
      data: caseStatus,
    });
  }
}
