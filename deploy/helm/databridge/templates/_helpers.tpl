{{- define "db.name" -}}{{ .Release.Name }}{{- end -}}
{{- define "db.labels" -}}
app.kubernetes.io/name: databridge
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end -}}
{{- define "db.image" -}}{{ .Values.image.repository }}:{{ .Values.image.tag }}{{- end -}}
{{- define "db.claim" -}}{{ .Values.storage.existingClaim | default (printf "%s-data" .Release.Name) }}{{- end -}}
{{- define "db.hmsHost" -}}{{ .Release.Name }}-metastore{{- end -}}
