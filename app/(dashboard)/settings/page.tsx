"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BellRing,
  Building2,
  FileText,
  RefreshCw,
  Save,
  Sparkles,
  Users,
} from "lucide-react"
import { apiClient } from "@/lib/api/client"
import type { AiSettings, AlertSettings, AppSettings, ShelterProfile, TemplateSettings } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [profile, setProfile] = useState<ShelterProfile | null>(null)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings | null>(null)
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null)
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null)

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getSettings()
      setSettings(response)
      setProfile(response.shelterProfile)
      setTemplateSettings(response.templateSettings)
      setAlertSettings(response.alertSettings)
      setAiSettings(response.aiSettings)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "설정을 불러오지 못했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchSettings()
  }, [])

  const saveSettings = async (payload: {
    shelterProfile?: Partial<ShelterProfile>
    templateSettings?: Partial<TemplateSettings>
    alertSettings?: Partial<AlertSettings>
    aiSettings?: Partial<AiSettings>
  }) => {
    try {
      setIsSaving(true)
      setError(null)
      const response = await apiClient.updateSettings(payload)
      setSettings(response)
      setProfile(response.shelterProfile)
      setTemplateSettings(response.templateSettings)
      setAlertSettings(response.alertSettings)
      setAiSettings(response.aiSettings)
      toast({
        title: "설정 저장 완료",
        description: "변경한 설정이 실제 DB에 저장되었습니다.",
      })
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "설정을 저장하지 못했습니다."
      setError(message)
      toast({
        title: "설정 저장 실패",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          설정을 불러오는 중입니다...
        </div>
      </div>
    )
  }

  if (!profile || !templateSettings || !alertSettings || !aiSettings || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">설정</h1>
          <p className="text-muted-foreground">보호소 정보와 문서 생성 기본값을 관리합니다.</p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>설정을 표시할 수 없습니다</AlertTitle>
          <AlertDescription>{error ?? "설정 데이터를 불러오지 못했습니다."}</AlertDescription>
        </Alert>
        <Button onClick={() => void fetchSettings()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">설정</h1>
          <p className="text-muted-foreground">
            보호소 기본 정보, 문서 생성 기본값, 알림 기준, 사용자별 AI 기본값을 관리합니다.
          </p>
        </div>
        <Button variant="outline" onClick={() => void fetchSettings()} disabled={isLoading || isSaving}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>저장 또는 조회 중 문제가 발생했습니다</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="shelter" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shelter" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            보호소 정보
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            범위 안내
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            문서 기본값
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            알림 기준
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI 설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shelter">
          <Card>
            <CardHeader>
              <CardTitle>보호소 프로필</CardTitle>
              <CardDescription>
                보호소의 기본 정보를 저장합니다. 이 정보는 문서 생성과 대시보드 전반에 반영됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shelterName">보호소 이름</Label>
                  <Input
                    id="shelterName"
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile((prev) => (prev ? { ...prev, phone: event.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(event) =>
                    setProfile((prev) => (prev ? { ...prev, address: event.target.value } : prev))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryCode">국가 코드</Label>
                  <Input
                    id="countryCode"
                    value={profile.countryCode}
                    onChange={(event) =>
                      setProfile((prev) => (prev ? { ...prev, countryCode: event.target.value.toUpperCase() } : prev))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">보호소 소개</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(event) =>
                    setProfile((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                  }
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div>
                  <Label className="font-medium">보호소 활성 상태</Label>
                  <p className="text-sm text-muted-foreground">
                    비활성화하면 신규 작업 전 안내용으로만 사용할 수 있습니다.
                  </p>
                </div>
                <Switch
                  checked={profile.isActive}
                  onCheckedChange={(checked) =>
                    setProfile((prev) => (prev ? { ...prev, isActive: checked } : prev))
                  }
                />
              </div>

              <Button
                onClick={() =>
                  void saveSettings({
                    shelterProfile: {
                      name: profile.name,
                      phone: profile.phone,
                      address: profile.address,
                      email: profile.email,
                      description: profile.description,
                      countryCode: profile.countryCode,
                      isActive: profile.isActive,
                    },
                  })
                }
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "저장 중..." : "보호소 정보 저장"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>설정 범위 안내</CardTitle>
              <CardDescription>
                이번 구현에서는 기존 설정 저장 기능을 실제 DB와 연결하는 데 집중했습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>보호소 기본 정보, 문서 생성 기본값, 알림 기준은 보호소 단위로 저장됩니다.</p>
              <p>AI 설정은 사용자 프로필 단위로 저장됩니다.</p>
              <p>직원 계정 생성/권한 관리는 현재 범위 밖이라 별도 구현이 필요합니다.</p>
              <p>
                현재 저장 대상 프로필: {settings.scope.profileId ? settings.scope.profileId : "자동 연결된 활성 프로필 없음"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>문서 생성 기본값</CardTitle>
              <CardDescription>
                문서 생성 시 기본으로 사용할 언어와 메타 정보 포함 여부를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">기본 문서 언어</Label>
                <Select
                  value={templateSettings.defaultLanguage}
                  onValueChange={(value: "en" | "ko") =>
                    setTemplateSettings((prev) => (prev ? { ...prev, defaultLanguage: value } : prev))
                  }
                >
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue placeholder="기본 언어를 선택하세요." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">보호소 정보 포함</Label>
                    <p className="text-sm text-muted-foreground">
                      문서에 보호소 이름과 소개를 기본 포함합니다.
                    </p>
                  </div>
                  <Switch
                    checked={templateSettings.includeShelterInfo}
                    onCheckedChange={(checked) =>
                      setTemplateSettings((prev) => (prev ? { ...prev, includeShelterInfo: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">연락처 정보 포함</Label>
                    <p className="text-sm text-muted-foreground">
                      문서 하단에 연락처와 이메일을 함께 넣습니다.
                    </p>
                  </div>
                  <Switch
                    checked={templateSettings.includeContactInfo}
                    onCheckedChange={(checked) =>
                      setTemplateSettings((prev) => (prev ? { ...prev, includeContactInfo: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">생성 시각 표시</Label>
                    <p className="text-sm text-muted-foreground">
                      문서 초안에 생성 날짜와 시간을 함께 표시합니다.
                    </p>
                  </div>
                  <Switch
                    checked={templateSettings.includeTimestamp}
                    onCheckedChange={(checked) =>
                      setTemplateSettings((prev) => (prev ? { ...prev, includeTimestamp: checked } : prev))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customFooter">커스텀 푸터 문구</Label>
                <Textarea
                  id="customFooter"
                  placeholder="문서 하단에 추가할 문구를 입력하세요."
                  value={templateSettings.customFooter}
                  onChange={(event) =>
                    setTemplateSettings((prev) => (prev ? { ...prev, customFooter: event.target.value } : prev))
                  }
                  rows={3}
                />
              </div>

              <Button
                onClick={() =>
                  void saveSettings({
                    templateSettings: {
                      defaultLanguage: templateSettings.defaultLanguage,
                      includeShelterInfo: templateSettings.includeShelterInfo,
                      includeContactInfo: templateSettings.includeContactInfo,
                      includeTimestamp: templateSettings.includeTimestamp,
                      customFooter: templateSettings.customFooter,
                    },
                  })
                }
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "저장 중..." : "문서 기본값 저장"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>건강 알림 기준 설정</CardTitle>
              <CardDescription>
                일일 케어 기록을 바탕으로 어떤 조건에서 알림을 만들지 저장합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">절반 섭취 시 식욕 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      급여 상태가 절반 섭취일 때 알림 후보로 판단합니다.
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.appetiteAlertOnHalfFeeding}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) =>
                        prev ? { ...prev, appetiteAlertOnHalfFeeding: checked } : prev
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">거의 먹지 않음 시 식욕 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      급여 상태가 거의 먹지 않음일 때 즉시 알림 후보로 판단합니다.
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.appetiteAlertOnNoFeeding}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) =>
                        prev ? { ...prev, appetiteAlertOnNoFeeding: checked } : prev
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">음수 부족 알림</Label>
                    <p className="text-sm text-muted-foreground">물 섭취가 부족하거나 거의 없을 때 알림을 만듭니다.</p>
                  </div>
                  <Switch
                    checked={alertSettings.lowWaterAlertEnabled}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => (prev ? { ...prev, lowWaterAlertEnabled: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">저활력 알림</Label>
                    <p className="text-sm text-muted-foreground">활력 상태가 낮음 또는 무기력일 때 알림을 만듭니다.</p>
                  </div>
                  <Switch
                    checked={alertSettings.lowEnergyAlertEnabled}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => (prev ? { ...prev, lowEnergyAlertEnabled: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">행동 이상 알림</Label>
                    <p className="text-sm text-muted-foreground">
                      불안 또는 공격성 표시가 있으면 행동 알림을 만듭니다.
                    </p>
                  </div>
                  <Switch
                    checked={alertSettings.behaviorAlertEnabled}
                    onCheckedChange={(checked) =>
                      setAlertSettings((prev) => (prev ? { ...prev, behaviorAlertEnabled: checked } : prev))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vomitingPriority">구토 알림 우선순위</Label>
                  <Select
                    value={alertSettings.vomitingAlertPriority}
                    onValueChange={(value: AlertSettings["vomitingAlertPriority"]) =>
                      setAlertSettings((prev) => (prev ? { ...prev, vomitingAlertPriority: value } : prev))
                    }
                  >
                    <SelectTrigger id="vomitingPriority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">긴급</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generalPriority">일반 건강 알림 우선순위</Label>
                  <Select
                    value={alertSettings.generalHealthAlertPriority}
                    onValueChange={(value: AlertSettings["generalHealthAlertPriority"]) =>
                      setAlertSettings((prev) =>
                        prev ? { ...prev, generalHealthAlertPriority: value } : prev
                      )
                    }
                  >
                    <SelectTrigger id="generalPriority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">긴급</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() =>
                  void saveSettings({
                    alertSettings: {
                      appetiteAlertOnHalfFeeding: alertSettings.appetiteAlertOnHalfFeeding,
                      appetiteAlertOnNoFeeding: alertSettings.appetiteAlertOnNoFeeding,
                      lowWaterAlertEnabled: alertSettings.lowWaterAlertEnabled,
                      lowEnergyAlertEnabled: alertSettings.lowEnergyAlertEnabled,
                      behaviorAlertEnabled: alertSettings.behaviorAlertEnabled,
                      vomitingAlertPriority: alertSettings.vomitingAlertPriority,
                      generalHealthAlertPriority: alertSettings.generalHealthAlertPriority,
                    },
                  })
                }
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "저장 중..." : "알림 기준 저장"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>사용자 AI 기본값</CardTitle>
              <CardDescription>
                문서 생성 시 현재 사용자 기준으로 적용할 AI 관련 기본값입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">자동 번역</Label>
                    <p className="text-sm text-muted-foreground">
                      생성된 내용을 기본적으로 영문 초안에 맞춰 번역합니다.
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.autoTranslate}
                    onCheckedChange={(checked) =>
                      setAiSettings((prev) => (prev ? { ...prev, autoTranslate: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">공식적인 어조</Label>
                    <p className="text-sm text-muted-foreground">
                      문서 표현을 보다 공식적이고 전달용 문서에 맞게 유지합니다.
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.formalTone}
                    onCheckedChange={(checked) =>
                      setAiSettings((prev) => (prev ? { ...prev, formalTone: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">이모지 제외</Label>
                    <p className="text-sm text-muted-foreground">
                      소개 문서에 장식용 이모지를 넣지 않도록 기본값을 유지합니다.
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.includeEmoji}
                    onCheckedChange={(checked) =>
                      setAiSettings((prev) => (prev ? { ...prev, includeEmoji: checked } : prev))
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                  <div>
                    <Label className="font-medium">안내 문구 포함</Label>
                    <p className="text-sm text-muted-foreground">
                      문서 하단에 자동 생성 초안임을 알리는 문구를 유지합니다.
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.includeDisclaimer}
                    onCheckedChange={(checked) =>
                      setAiSettings((prev) => (prev ? { ...prev, includeDisclaimer: checked } : prev))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={() =>
                  void saveSettings({
                    aiSettings: {
                      autoTranslate: aiSettings.autoTranslate,
                      includeEmoji: aiSettings.includeEmoji,
                      formalTone: aiSettings.formalTone,
                      includeDisclaimer: aiSettings.includeDisclaimer,
                    },
                  })
                }
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "저장 중..." : "AI 설정 저장"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
