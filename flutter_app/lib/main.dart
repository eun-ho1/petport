import 'package:flutter/material.dart';

import 'core/app_theme.dart';
import 'models/app_models.dart';
import 'services/animal_api_service.dart';
import 'services/api_config.dart';
import 'widgets/common.dart';

void main() {
  runApp(const AnimalMvpApp());
}

class AnimalMvpApp extends StatelessWidget {
  const AnimalMvpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PawBridge MVP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const HomeShell(),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  final AnimalApiService _service = AnimalApiService();
  int selectedIndex = 0;

  late final List<_NavItem> items = [
    _NavItem(
      label: '대시보드',
      icon: Icons.space_dashboard_rounded,
      screen: DashboardScreen(
        service: _service,
        onOpenDog: _openDogDetail,
      ),
    ),
    _NavItem(
      label: '강아지',
      icon: Icons.pets_rounded,
      screen: DogsScreen(
        service: _service,
        onOpenDog: _openDogDetail,
      ),
    ),
    _NavItem(
      label: '일일 케어',
      icon: Icons.fact_check_rounded,
      screen: DailyCareScreen(
        service: _service,
        onOpenDog: _openDogDetail,
        onOpenCareEntry: _openDailyCareEntry,
      ),
    ),
    const _NavItem(
      label: '문서',
      icon: Icons.description_rounded,
      screen: DocumentsScreen(),
    ),
    const _NavItem(
      label: '설정',
      icon: Icons.settings_rounded,
      screen: SettingsScreen(),
    ),
  ];

  void _openDogDetail(Dog dog) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DogDetailScreen(
          service: _service,
          dogId: dog.id,
          initialDog: dog,
          onOpenCareEntry: _openDailyCareEntry,
        ),
      ),
    );
  }

  Future<bool?> _openDailyCareEntry(
    Dog dog,
    DailyCareRecord? initialRecord,
  ) {
    return Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => DailyCareEntryScreen(
          service: _service,
          dog: dog,
          initialRecord: initialRecord,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.sizeOf(context).width >= 980;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Row(
          children: [
            if (isDesktop)
              _SideNavigation(
                items: items,
                selectedIndex: selectedIndex,
                onSelected: (index) => setState(() => selectedIndex = index),
              ),
            Expanded(
              child: Column(
                children: [
                  if (!isDesktop) _MobileHeader(title: items[selectedIndex].label),
                  Expanded(
                    child: IndexedStack(
                      index: selectedIndex,
                      children: items.map((item) => item.screen).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: isDesktop
          ? null
          : NavigationBar(
              selectedIndex: selectedIndex,
              onDestinationSelected: (index) =>
                  setState(() => selectedIndex = index),
              destinations: items
                  .map(
                    (item) => NavigationDestination(
                      icon: Icon(item.icon),
                      label: item.label,
                    ),
                  )
                  .toList(),
            ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.label,
    required this.icon,
    required this.screen,
  });

  final String label;
  final IconData icon;
  final Widget screen;
}

class _SideNavigation extends StatelessWidget {
  const _SideNavigation({
    required this.items,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<_NavItem> items;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppTheme.border),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 22, 18, 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  height: 52,
                  width: 52,
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.pets, color: Colors.white),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PawBridge',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '보호소 관리 MVP',
                        style: TextStyle(
                          color: AppTheme.mutedText,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            ...List.generate(
              items.length,
              (index) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Material(
                  color: index == selectedIndex
                      ? AppTheme.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(18),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () => onSelected(index),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            items[index].icon,
                            color: index == selectedIndex
                                ? Colors.white
                                : AppTheme.mutedText,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            items[index].label,
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: index == selectedIndex
                                  ? Colors.white
                                  : AppTheme.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.softOrange,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '실시간 API 연결',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  SizedBox(height: 6),
                  Text(
                    '모바일에서 저장한 일일 케어 기록은 웹 대시보드에서도 바로 확인할 수 있습니다.',
                    style: TextStyle(
                      color: AppTheme.mutedText,
                      fontSize: 12,
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MobileHeader extends StatelessWidget {
  const _MobileHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'PawBridge',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(99),
              border: Border.all(color: AppTheme.border),
            ),
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({
    super.key,
    required this.service,
    required this.onOpenDog,
  });

  final AnimalApiService service;
  final ValueChanged<Dog> onOpenDog;

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = true;
  String? _errorMessage;
  List<Dog> _dogs = const [];
  List<HealthAlert> _alerts = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        widget.service.fetchDogs(),
        widget.service.fetchHealthAlerts(resolved: false),
      ]);

      if (!mounted) return;

      setState(() {
        _dogs = results[0] as List<Dog>;
        _alerts = results[1] as List<HealthAlert>;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
        _loading = false;
      });
    }
  }

  void _openFilteredDogs(
    BuildContext context, {
    required String title,
    required String subtitle,
    required List<Dog> dogs,
  }) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => FilteredDogsScreen(
          title: title,
          subtitle: subtitle,
          dogs: dogs,
          onOpenDog: widget.onOpenDog,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dogsInCare = _dogs.where((dog) => dog.status != DogStatus.adopted).toList();
    final readyDogs = _dogs
        .where((dog) => dog.adoptionReadinessCode == 'ready')
        .toList();
    final vaccinationPendingDogs = _dogs
        .where((dog) => dog.vaccinationStatus != VaccinationStatus.complete)
        .toList();
    final medicalWatchDogs = _dogs
        .where((dog) => dog.status == DogStatus.treatment)
        .toList();
    final recentDogs = _dogs.take(3).toList();

    return Stack(
      children: [
        AppPage(
          title: '보호소 대시보드',
          subtitle: '웹에 등록된 강아지와 모바일에서 저장된 케어 기록을 함께 확인합니다.',
          showHeader: false,
          child: _loading
              ? const _LoadingState()
              : _errorMessage != null
                  ? _StatusView(
                      icon: Icons.cloud_off_rounded,
                      title: '대시보드를 불러오지 못했습니다',
                      message: _errorMessage!,
                      actionLabel: '다시 시도',
                      onAction: _load,
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.only(bottom: 96),
                        children: [
                          LayoutBuilder(
                            builder: (context, constraints) {
                              final columns = constraints.maxWidth >= 1100 ? 4 : 2;
                              const gap = 16.0;
                              final itemWidth =
                                  (constraints.maxWidth - (gap * (columns - 1))) /
                                      columns;

                              final cards = [
                                InfoStatCard(
                                  title: '보호 중 강아지',
                                  value: '${dogsInCare.length}',
                                  description: '현재 보호소에서 관리 중인 강아지 수',
                                  icon: Icons.pets_rounded,
                                  iconColor: AppTheme.primary,
                                  square: true,
                                  onTap: () => _openFilteredDogs(
                                    context,
                                    title: '보호 중 강아지',
                                    subtitle: '현재 보호 중인 강아지 목록입니다.',
                                    dogs: dogsInCare,
                                  ),
                                ),
                                InfoStatCard(
                                  title: '입양 준비 완료',
                                  value: '${readyDogs.length}',
                                  description: '문서 생성이 가능한 상태',
                                  icon: Icons.flight_takeoff_rounded,
                                  iconColor: AppTheme.success,
                                  square: true,
                                  onTap: () => _openFilteredDogs(
                                    context,
                                    title: '입양 준비 완료',
                                    subtitle: '입양 문서 준비가 가능한 강아지 목록입니다.',
                                    dogs: readyDogs,
                                  ),
                                ),
                                InfoStatCard(
                                  title: '예방접종 확인 필요',
                                  value: '${vaccinationPendingDogs.length}',
                                  description: '추가 확인 또는 접종이 필요한 상태',
                                  icon: Icons.warning_amber_rounded,
                                  iconColor: AppTheme.warning,
                                  square: true,
                                  onTap: () => _openFilteredDogs(
                                    context,
                                    title: '예방접종 확인 필요',
                                    subtitle: '예방접종 상태 점검이 필요한 강아지 목록입니다.',
                                    dogs: vaccinationPendingDogs,
                                  ),
                                ),
                                InfoStatCard(
                                  title: '건강 집중 관찰',
                                  value: '${medicalWatchDogs.length}',
                                  description: '치료 또는 건강 모니터링이 필요한 상태',
                                  icon: Icons.monitor_heart_rounded,
                                  iconColor: AppTheme.danger,
                                  square: true,
                                  onTap: () => _openFilteredDogs(
                                    context,
                                    title: '건강 집중 관찰',
                                    subtitle: '치료 중이거나 건강 관찰이 필요한 강아지 목록입니다.',
                                    dogs: medicalWatchDogs,
                                  ),
                                ),
                              ];

                              return Wrap(
                                spacing: gap,
                                runSpacing: gap,
                                children: cards
                                    .map(
                                      (card) => SizedBox(
                                        width: itemWidth,
                                        child: AspectRatio(
                                          aspectRatio: 1,
                                          child: card,
                                        ),
                                      ),
                                    )
                                    .toList(),
                              );
                            },
                          ),
                          const SizedBox(height: 24),
                          const SectionTitle(
                            title: '빠른 흐름',
                            subtitle: '웹과 모바일이 같은 API를 사용하므로 기록과 상태가 한 번에 맞춰집니다.',
                          ),
                          const SizedBox(height: 12),
                          const SurfaceCard(
                            child: Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [
                                NumberStep(
                                  step: '1',
                                  title: '웹에서 등록',
                                  description: '웹 대시보드에서 강아지 기본 정보를 등록합니다.',
                                ),
                                NumberStep(
                                  step: '2',
                                  title: '모바일로 기록',
                                  description: '모바일에서 일일 케어와 상태를 바로 입력합니다.',
                                ),
                                NumberStep(
                                  step: '3',
                                  title: '알림 확인',
                                  description: '건강 이상 알림을 즉시 확인하고 해결 처리합니다.',
                                ),
                                NumberStep(
                                  step: '4',
                                  title: '웹에서 문서화',
                                  description: '누적된 데이터를 기반으로 문서를 생성합니다.',
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),
                          ResponsiveWrap(
                            children: [
                              SurfaceCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SectionTitle(
                                      title: '최근 강아지',
                                      subtitle: '웹에서 등록된 최신 강아지 목록입니다.',
                                    ),
                                    const SizedBox(height: 12),
                                    if (recentDogs.isEmpty)
                                      const _EmptyInlineText(
                                        message: '등록된 강아지가 아직 없습니다.',
                                      )
                                    else
                                      ...recentDogs.map(
                                        (dog) => Padding(
                                          padding: const EdgeInsets.only(bottom: 12),
                                          child: GestureDetector(
                                            onTap: () => widget.onOpenDog(dog),
                                            child: DogListTile(dog: dog),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              SurfaceCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SectionTitle(
                                      title: '미해결 알림',
                                      subtitle: '모바일에서 기록된 이상 징후가 여기에 표시됩니다.',
                                    ),
                                    const SizedBox(height: 12),
                                    if (_alerts.isEmpty)
                                      const _EmptyInlineText(
                                        message: '현재 미해결 건강 알림이 없습니다.',
                                      )
                                    else
                                      ..._alerts.take(4).map(
                                        (alert) => Padding(
                                          padding: const EdgeInsets.only(bottom: 12),
                                          child: AlertTile(alert: alert),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
        ),
        Positioned(
          right: 24,
          bottom: 24,
          child: FloatingActionButton(
            onPressed: _load,
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
            child: const Icon(Icons.refresh_rounded),
          ),
        ),
      ],
    );
  }
}

class DogsScreen extends StatefulWidget {
  const DogsScreen({
    super.key,
    required this.service,
    required this.onOpenDog,
  });

  final AnimalApiService service;
  final ValueChanged<Dog> onOpenDog;

  @override
  State<DogsScreen> createState() => _DogsScreenState();
}

class _DogsScreenState extends State<DogsScreen> {
  bool _loading = true;
  String? _errorMessage;
  List<Dog> _dogs = const [];
  String query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final dogs = await widget.service.fetchDogs();
      if (!mounted) return;
      setState(() {
        _dogs = dogs;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lower = query.toLowerCase();
    final filteredDogs = _dogs.where((dog) {
      return dog.name.toLowerCase().contains(lower) ||
          dog.breed.toLowerCase().contains(lower) ||
          dog.status.label.toLowerCase().contains(lower);
    }).toList();

    return AppPage(
      title: '강아지 프로필',
      subtitle: '웹에서 등록한 강아지를 모바일에서도 바로 조회할 수 있습니다.',
      actions: [
        IconButton.filledTonal(
          onPressed: _load,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: _loading
          ? const _LoadingState()
          : _errorMessage != null
              ? _StatusView(
                  icon: Icons.search_off_rounded,
                  title: '강아지 목록을 불러오지 못했습니다',
                  message: _errorMessage!,
                  actionLabel: '다시 시도',
                  onAction: _load,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SearchBox(
                        hintText: '이름, 품종, 상태로 검색',
                        onChanged: (value) => setState(() => query = value),
                      ),
                      const SizedBox(height: 20),
                      if (_dogs.isEmpty)
                        const _StatusView(
                          icon: Icons.pets_outlined,
                          title: '등록된 강아지가 없습니다',
                          message: '웹 대시보드에서 강아지를 등록하면 모바일 목록에 자동으로 표시됩니다.',
                        )
                      else if (filteredDogs.isEmpty)
                        const _StatusView(
                          icon: Icons.filter_alt_off_rounded,
                          title: '검색 결과가 없습니다',
                          message: '다른 이름이나 품종으로 다시 검색해 보세요.',
                        )
                      else
                        Wrap(
                          spacing: 16,
                          runSpacing: 16,
                          children: filteredDogs
                              .map(
                                (dog) => SizedBox(
                                  width: 320,
                                  child: DogCard(
                                    dog: dog,
                                    onTap: () => widget.onOpenDog(dog),
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                    ],
                  ),
                ),
    );
  }
}

class FilteredDogsScreen extends StatefulWidget {
  const FilteredDogsScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.dogs,
    required this.onOpenDog,
  });

  final String title;
  final String subtitle;
  final List<Dog> dogs;
  final ValueChanged<Dog> onOpenDog;

  @override
  State<FilteredDogsScreen> createState() => _FilteredDogsScreenState();
}

class _FilteredDogsScreenState extends State<FilteredDogsScreen> {
  String query = '';

  @override
  Widget build(BuildContext context) {
    final lower = query.toLowerCase();
    final filteredDogs = widget.dogs.where((dog) {
      return dog.name.toLowerCase().contains(lower) ||
          dog.breed.toLowerCase().contains(lower) ||
          dog.status.label.toLowerCase().contains(lower);
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text(widget.title)),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.subtitle,
              style: const TextStyle(
                color: AppTheme.mutedText,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            SearchBox(
              hintText: '이름, 품종, 상태로 검색',
              onChanged: (value) => setState(() => query = value),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: filteredDogs.isEmpty
                  ? const _StatusView(
                      icon: Icons.search_off_rounded,
                      title: '조건에 맞는 강아지가 없습니다',
                      message: '다른 검색어로 다시 확인해 보세요.',
                    )
                  : SingleChildScrollView(
                      child: Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: filteredDogs
                            .map(
                              (dog) => SizedBox(
                                width: 320,
                                child: DogCard(
                                  dog: dog,
                                  onTap: () => widget.onOpenDog(dog),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class DogDetailScreen extends StatefulWidget {
  const DogDetailScreen({
    super.key,
    required this.service,
    required this.dogId,
    required this.onOpenCareEntry,
    this.initialDog,
  });

  final AnimalApiService service;
  final String dogId;
  final Dog? initialDog;
  final Future<bool?> Function(Dog dog, DailyCareRecord? record) onOpenCareEntry;

  @override
  State<DogDetailScreen> createState() => _DogDetailScreenState();
}

class _DogDetailScreenState extends State<DogDetailScreen> {
  bool _loading = true;
  String? _errorMessage;
  Dog? _dog;
  List<DailyCareRecord> _records = const [];

  @override
  void initState() {
    super.initState();
    _dog = widget.initialDog;
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final results = await Future.wait([
        widget.service.fetchDog(widget.dogId),
        widget.service.fetchDailyCareRecords(widget.dogId),
      ]);

      if (!mounted) return;
      setState(() {
        _dog = results[0] as Dog;
        _records = results[1] as List<DailyCareRecord>;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
        _loading = false;
      });
    }
  }

  Future<void> _openCareEntry() async {
    final dog = _dog;
    if (dog == null) return;
    final updated = await widget.onOpenCareEntry(dog, _findTodayRecord(_records));
    if (updated == true) {
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final dog = _dog;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(dog?.name ?? '강아지 상세'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: _loading && dog == null
          ? const _LoadingState()
          : _errorMessage != null && dog == null
              ? _StatusView(
                  icon: Icons.error_outline_rounded,
                  title: '상세 정보를 불러오지 못했습니다',
                  message: _errorMessage!,
                  actionLabel: '다시 시도',
                  onAction: _load,
                )
              : dog == null
                  ? const _StatusView(
                      icon: Icons.pets_outlined,
                      title: '강아지 정보를 찾을 수 없습니다',
                      message: '삭제되었거나 접근할 수 없는 데이터일 수 있습니다.',
                    )
                  : ListView(
                      padding: const EdgeInsets.all(20),
                      children: [
                        if (_errorMessage != null) ...[
                          _InlineMessageCard(
                            icon: Icons.info_outline_rounded,
                            title: '최신 데이터를 다시 불러오지 못했습니다',
                            message: _errorMessage!,
                          ),
                          const SizedBox(height: 16),
                        ],
                        SurfaceCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(20),
                                    child: Image.network(
                                      dog.photoUrl,
                                      width: 120,
                                      height: 120,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => Container(
                                        width: 120,
                                        height: 120,
                                        color: AppTheme.softOrange,
                                        alignment: Alignment.center,
                                        child: const Icon(Icons.pets_rounded, size: 44),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                dog.name,
                                                style: const TextStyle(
                                                  fontSize: 28,
                                                  fontWeight: FontWeight.w800,
                                                ),
                                              ),
                                            ),
                                            AppChip(
                                              label: dog.status.label,
                                              backgroundColor: dog.status.color
                                                  .withValues(alpha: 0.14),
                                              foregroundColor: dog.status.color,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          '${dog.breed} · ${dog.ageLabel} · ${dog.genderLabel}',
                                          style: const TextStyle(
                                            color: AppTheme.mutedText,
                                            fontSize: 15,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        Wrap(
                                          spacing: 8,
                                          runSpacing: 8,
                                          children: [
                                            AppChip(
                                              label: dog.vaccinationStatus.label,
                                              backgroundColor: dog
                                                  .vaccinationStatus.color
                                                  .withValues(alpha: 0.14),
                                              foregroundColor:
                                                  dog.vaccinationStatus.color,
                                            ),
                                            AppChip(
                                              label: '준비도 ${dog.readinessScore}%',
                                              backgroundColor: readinessColor(
                                                dog.readinessScore,
                                              ).withValues(alpha: 0.14),
                                              foregroundColor: readinessColor(
                                                dog.readinessScore,
                                              ),
                                            ),
                                            AppChip(
                                              label: dog.adoptionReadinessLabel,
                                              backgroundColor: AppTheme.softOrange,
                                              foregroundColor: AppTheme.primary,
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Text(
                                dog.personality.isEmpty
                                    ? '성격 메모가 아직 없습니다.'
                                    : dog.personality,
                                style: const TextStyle(height: 1.5),
                              ),
                              const SizedBox(height: 20),
                              Wrap(
                                spacing: 12,
                                runSpacing: 12,
                                children: [
                                  FilledButton.icon(
                                    onPressed: _openCareEntry,
                                    icon: const Icon(Icons.edit_note_rounded),
                                    label: const Text('오늘 케어 기록 입력'),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: _load,
                                    icon: const Icon(Icons.refresh_rounded),
                                    label: const Text('새로고침'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ResponsiveWrap(
                          children: [
                            SurfaceCard(
                              child: DetailBlock(
                                title: '구조 이야기',
                                lines: [
                                  dog.rescueStory.isEmpty
                                      ? '구조 이야기가 아직 없습니다.'
                                      : dog.rescueStory,
                                  '구조 장소: ${dog.rescueLocation.isEmpty ? '미입력' : dog.rescueLocation}',
                                  '구조 날짜: ${dog.rescueDate.isEmpty ? '미입력' : dog.rescueDate}',
                                ],
                              ),
                            ),
                            SurfaceCard(
                              child: DetailBlock(
                                title: '건강 요약',
                                lines: [
                                  dog.medicalNotes.isEmpty
                                      ? '건강 메모가 아직 없습니다.'
                                      : dog.medicalNotes,
                                  '체중: ${dog.weightKg > 0 ? dog.weightKg.toStringAsFixed(1) : '-'}kg',
                                  '중성화 여부: ${dog.isNeutered ? '완료' : '미완료'}',
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SurfaceCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SectionTitle(
                                title: '예방접종 기록',
                                subtitle: '웹과 모바일에서 공통으로 확인하는 접종 정보입니다.',
                              ),
                              const SizedBox(height: 12),
                              if (dog.vaccinations.isEmpty)
                                const _EmptyInlineText(
                                  message: '등록된 예방접종 기록이 없습니다.',
                                )
                              else
                                ...dog.vaccinations.map(
                                  (record) => Padding(
                                    padding: const EdgeInsets.only(bottom: 10),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.vaccines_rounded,
                                          color: AppTheme.success,
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            '${record.name} · ${record.date}',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                        if (record.nextDue != null)
                                          Text(
                                            '다음 접종: ${record.nextDue}',
                                            style: const TextStyle(
                                              color: AppTheme.mutedText,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        SurfaceCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SectionTitle(
                                title: '최근 일일 케어',
                                subtitle: '모바일에서 입력한 최근 기록이 여기에 누적됩니다.',
                              ),
                              const SizedBox(height: 12),
                              if (_records.isEmpty)
                                const _EmptyInlineText(
                                  message: '아직 저장된 일일 케어 기록이 없습니다.',
                                )
                              else
                                ..._records.take(5).map(
                                  (record) => Padding(
                                    padding: const EdgeInsets.only(bottom: 12),
                                    child: _CareRecordSummary(record: record),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
    );
  }
}

class DailyCareScreen extends StatefulWidget {
  const DailyCareScreen({
    super.key,
    required this.service,
    required this.onOpenDog,
    required this.onOpenCareEntry,
  });

  final AnimalApiService service;
  final ValueChanged<Dog> onOpenDog;
  final Future<bool?> Function(Dog dog, DailyCareRecord? record) onOpenCareEntry;

  @override
  State<DailyCareScreen> createState() => _DailyCareScreenState();
}

class _DailyCareScreenState extends State<DailyCareScreen> {
  bool _loading = true;
  String? _errorMessage;
  List<Dog> _dogs = const [];
  List<HealthAlert> _alerts = const [];
  Map<String, DailyCareRecord?> _todayRecords = const {};
  String query = '';
  String? _resolvingAlertId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final dogs = await widget.service.fetchDogs();
      final alerts = await widget.service.fetchHealthAlerts(resolved: false);
      final recordEntries = await Future.wait(
        dogs.map((dog) async {
          final records = await widget.service.fetchDailyCareRecords(dog.id);
          return MapEntry(dog.id, _findTodayRecord(records));
        }),
      );

      if (!mounted) return;
      setState(() {
        _dogs = dogs;
        _alerts = alerts;
        _todayRecords = Map<String, DailyCareRecord?>.fromEntries(recordEntries);
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
        _loading = false;
      });
    }
  }

  Future<void> _resolveAlert(HealthAlert alert) async {
    setState(() => _resolvingAlertId = alert.id);
    try {
      await widget.service.resolveHealthAlert(alert.id);
      if (!mounted) return;
      setState(() {
        _alerts = _alerts.where((item) => item.id != alert.id).toList();
        _resolvingAlertId = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${alert.dogName} 알림을 해결 처리했습니다.')),
      );
    } catch (error) {
      if (!mounted) return;
      setState(() => _resolvingAlertId = null);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_friendlyError(error))),
      );
    }
  }

  Future<void> _openCareEntry(Dog dog) async {
    final updated = await widget.onOpenCareEntry(dog, _todayRecords[dog.id]);
    if (updated == true) {
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lower = query.toLowerCase();
    final filteredDogs = _dogs.where((dog) {
      return dog.name.toLowerCase().contains(lower) ||
          dog.breed.toLowerCase().contains(lower);
    }).toList();

    final checkedTodayDogs = _dogs
        .where((dog) => _todayRecords[dog.id] != null)
        .toList();
    final missingRecordDogs = _dogs
        .where((dog) => _todayRecords[dog.id] == null)
        .toList();
    final abnormalHealthDogs = _dogs
        .where((dog) => _todayRecords[dog.id]?.hasAlert == true)
        .toList();
    final behaviorWarningDogs = _dogs
        .where((dog) => _todayRecords[dog.id]?.hasBehaviorIssue == true)
        .toList();

    return AppPage(
      title: '일일 케어',
      subtitle: '급여, 투약, 행동 변화를 기록하고 건강 알림을 바로 처리합니다.',
      actions: [
        IconButton.filledTonal(
          onPressed: _load,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: _loading
          ? const _LoadingState()
          : _errorMessage != null
              ? _StatusView(
                  icon: Icons.event_busy_rounded,
                  title: '일일 케어 화면을 불러오지 못했습니다',
                  message: _errorMessage!,
                  actionLabel: '다시 시도',
                  onAction: _load,
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final columns = constraints.maxWidth >= 1100 ? 4 : 2;
                          const gap = 16.0;
                          final itemWidth =
                              (constraints.maxWidth - (gap * (columns - 1))) /
                                  columns;

                          final cards = [
                            InfoStatCard(
                              title: '오늘 기록 완료',
                              value: '${checkedTodayDogs.length}',
                              description: '일일 케어 입력이 완료된 강아지',
                              icon: Icons.check_circle_rounded,
                              iconColor: AppTheme.success,
                              square: true,
                            ),
                            InfoStatCard(
                              title: '기록 필요',
                              value: '${missingRecordDogs.length}',
                              description: '오늘 케어 입력이 아직 없는 강아지',
                              icon: Icons.schedule_rounded,
                              iconColor: AppTheme.warning,
                              square: true,
                            ),
                            InfoStatCard(
                              title: '건강 확인 필요',
                              value: '${abnormalHealthDogs.length}',
                              description: '구토, 식욕 저하, 저활력 등이 감지됨',
                              icon: Icons.emergency_rounded,
                              iconColor: AppTheme.danger,
                              square: true,
                            ),
                            InfoStatCard(
                              title: '행동 관찰',
                              value: '${behaviorWarningDogs.length}',
                              description: '불안 또는 공격성 관찰 기록',
                              icon: Icons.psychology_alt_rounded,
                              iconColor: AppTheme.accent,
                              square: true,
                            ),
                          ];

                          return Wrap(
                            spacing: gap,
                            runSpacing: gap,
                            children: cards
                                .map(
                                  (card) => SizedBox(
                                    width: itemWidth,
                                    child: AspectRatio(
                                      aspectRatio: 1,
                                      child: card,
                                    ),
                                  ),
                                )
                                .toList(),
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                      SearchBox(
                        hintText: '오늘 케어 상태로 강아지 검색',
                        onChanged: (value) => setState(() => query = value),
                      ),
                      const SizedBox(height: 16),
                      if (_dogs.isEmpty)
                        const _StatusView(
                          icon: Icons.pets_outlined,
                          title: '강아지 데이터가 없습니다',
                          message: '웹에서 강아지를 등록하면 모바일 케어 기록을 시작할 수 있습니다.',
                        )
                      else ...[
                        ...filteredDogs.map((dog) {
                          final record = _todayRecords[dog.id];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: SurfaceCard(
                              child: Row(
                                children: [
                                  GestureDetector(
                                    onTap: () => widget.onOpenDog(dog),
                                    child: CircleAvatar(
                                      radius: 28,
                                      backgroundImage: NetworkImage(dog.photoUrl),
                                      onBackgroundImageError: (_, __) {},
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () => widget.onOpenDog(dog),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            dog.name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${dog.breed} · ${record?.feedingStatus.label ?? '오늘 기록 없음'}',
                                            style: const TextStyle(
                                              color: AppTheme.mutedText,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      AppChip(
                                        label: record == null
                                            ? '기록 필요'
                                            : record.summaryLabel,
                                        backgroundColor: (record == null
                                                ? AppTheme.warning
                                                : record.summaryColor)
                                            .withValues(alpha: 0.14),
                                        foregroundColor: record == null
                                            ? AppTheme.warning
                                            : record.summaryColor,
                                      ),
                                      const SizedBox(height: 10),
                                      OutlinedButton.icon(
                                        onPressed: () => _openCareEntry(dog),
                                        icon: const Icon(Icons.edit_note_rounded),
                                        label: Text(
                                          record == null ? '기록 입력' : '다시 입력',
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 8),
                        const SectionTitle(
                          title: '미해결 건강 알림',
                          subtitle: '모바일에서 기록된 이상 징후를 바로 해결 처리할 수 있습니다.',
                        ),
                        const SizedBox(height: 12),
                        if (_alerts.isEmpty)
                          const _StatusView(
                            icon: Icons.check_circle_outline_rounded,
                            title: '현재 미해결 알림이 없습니다',
                            message: '이상 기록이 생기면 여기에 자동으로 표시됩니다.',
                          )
                        else
                          ..._alerts.map(
                            (alert) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _AlertActionCard(
                                alert: alert,
                                resolving: _resolvingAlertId == alert.id,
                                onOpenDog: () {
                                  final dog = _dogs.cast<Dog?>().firstWhere(
                                        (item) => item?.id == alert.dogId,
                                        orElse: () => null,
                                      );
                                  if (dog != null) {
                                    widget.onOpenDog(dog);
                                  }
                                },
                                onResolve: () => _resolveAlert(alert),
                              ),
                            ),
                          ),
                      ],
                    ],
                  ),
                ),
    );
  }
}

class DailyCareEntryScreen extends StatefulWidget {
  const DailyCareEntryScreen({
    super.key,
    required this.service,
    required this.dog,
    this.initialRecord,
  });

  final AnimalApiService service;
  final Dog dog;
  final DailyCareRecord? initialRecord;

  @override
  State<DailyCareEntryScreen> createState() => _DailyCareEntryScreenState();
}

class _DailyCareEntryScreenState extends State<DailyCareEntryScreen> {
  late final TextEditingController _feedingAmountController;
  late final TextEditingController _medicationNotesController;
  late final TextEditingController _vomitingNotesController;
  late final TextEditingController _behaviorNotesController;
  late final TextEditingController _healthNotesController;
  late final TextEditingController _specialObservationsController;
  late final TextEditingController _weightController;
  late final TextEditingController _temperatureController;

  late String _date;
  late String _feedingCompletion;
  late String _waterIntake;
  late String _stoolCondition;
  late String _energyLevel;
  late bool _medicationGiven;
  late bool _vomiting;
  late bool _aggression;
  late bool _anxiety;

  bool _submitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final record = widget.initialRecord;
    _date = record?.date ?? _todayIso();
    _feedingCompletion = record?.feedingCompletionCode ?? 'not_fed';
    _waterIntake = record?.waterIntakeCode ?? 'normal';
    _stoolCondition = record?.stoolConditionCode ?? 'unknown';
    _energyLevel = record?.energyLevelCode ?? 'normal';
    _medicationGiven = record?.medicationGiven ?? false;
    _vomiting = record?.vomiting ?? false;
    _aggression = record?.aggression ?? false;
    _anxiety = record?.anxiety ?? false;
    _feedingAmountController = TextEditingController(
      text: record?.feedingAmount?.toString() ?? '',
    );
    _medicationNotesController = TextEditingController(
      text: record?.medicationNotes ?? '',
    );
    _vomitingNotesController = TextEditingController(
      text: record?.vomitingNotes ?? '',
    );
    _behaviorNotesController = TextEditingController(
      text: record?.behaviorNotes ?? '',
    );
    _healthNotesController = TextEditingController(
      text: record?.healthNotes ?? '',
    );
    _specialObservationsController = TextEditingController(
      text: record?.specialObservations ?? '',
    );
    _weightController = TextEditingController(
      text: record?.weight?.toString() ?? '',
    );
    _temperatureController = TextEditingController(
      text: record?.temperature?.toString() ?? '',
    );
  }

  @override
  void dispose() {
    _feedingAmountController.dispose();
    _medicationNotesController.dispose();
    _vomitingNotesController.dispose();
    _behaviorNotesController.dispose();
    _healthNotesController.dispose();
    _specialObservationsController.dispose();
    _weightController.dispose();
    _temperatureController.dispose();
    super.dispose();
  }

  Future<void> _submit({required bool isDraft}) async {
    setState(() {
      _submitting = true;
      _errorMessage = null;
    });

    try {
      final input = DailyCareInput(
        date: _date,
        feedingAmount: _parseInt(_feedingAmountController.text),
        feedingCompletion: _feedingCompletion,
        waterIntake: _waterIntake,
        medicationGiven: _medicationGiven,
        medicationNotes: _cleanText(_medicationNotesController.text),
        stoolCondition: _stoolCondition,
        vomiting: _vomiting,
        vomitingNotes: _cleanText(_vomitingNotesController.text),
        energyLevel: _energyLevel,
        aggression: _aggression,
        anxiety: _anxiety,
        behaviorNotes: _cleanText(_behaviorNotesController.text),
        healthNotes: _cleanText(_healthNotesController.text),
        specialObservations: _cleanText(_specialObservationsController.text),
        weight: _parseDouble(_weightController.text),
        temperature: _parseDouble(_temperatureController.text),
        isDraft: isDraft,
      );

      await widget.service.saveDailyCareRecord(widget.dog.id, input);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isDraft ? '일일 케어를 임시 저장했습니다.' : '일일 케어를 저장했습니다.',
          ),
        ),
      );
      Navigator.of(context).pop(true);
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _friendlyError(error);
        _submitting = false;
      });
      return;
    }

    if (!mounted) return;
    setState(() => _submitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('${widget.dog.name} 일일 케어'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (_errorMessage != null) ...[
            _InlineMessageCard(
              icon: Icons.error_outline_rounded,
              title: '저장에 실패했습니다',
              message: _errorMessage!,
            ),
            const SizedBox(height: 16),
          ],
          SurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: '오늘 기록',
                  subtitle: '같은 날짜로 다시 저장하면 기존 기록이 업데이트됩니다.',
                ),
                const SizedBox(height: 12),
                _ReadOnlyField(label: '기록 날짜', value: _date),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: _feedingCompletion,
                  decoration: const InputDecoration(labelText: '급여 상태'),
                  items: const [
                    DropdownMenuItem(value: 'complete', child: Text('완식')),
                    DropdownMenuItem(value: 'most', child: Text('대부분 섭취')),
                    DropdownMenuItem(value: 'half', child: Text('절반 섭취')),
                    DropdownMenuItem(value: 'none', child: Text('거의 먹지 않음')),
                    DropdownMenuItem(value: 'not_fed', child: Text('급여 전')),
                  ],
                  onChanged: (value) =>
                      setState(() => _feedingCompletion = value ?? 'not_fed'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _feedingAmountController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: '급여량(g)',
                    hintText: '예: 180',
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _waterIntake,
                  decoration: const InputDecoration(labelText: '음수 상태'),
                  items: const [
                    DropdownMenuItem(value: 'enough', child: Text('충분')),
                    DropdownMenuItem(value: 'normal', child: Text('보통')),
                    DropdownMenuItem(value: 'low', child: Text('부족')),
                    DropdownMenuItem(value: 'none', child: Text('거의 없음')),
                  ],
                  onChanged: (value) =>
                      setState(() => _waterIntake = value ?? 'normal'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _stoolCondition,
                  decoration: const InputDecoration(labelText: '배변 상태'),
                  items: const [
                    DropdownMenuItem(value: 'normal', child: Text('정상')),
                    DropdownMenuItem(value: 'soft', child: Text('묽음')),
                    DropdownMenuItem(value: 'diarrhea', child: Text('설사')),
                    DropdownMenuItem(value: 'constipation', child: Text('변비')),
                    DropdownMenuItem(value: 'blood', child: Text('혈변')),
                    DropdownMenuItem(value: 'unknown', child: Text('확인 전')),
                  ],
                  onChanged: (value) =>
                      setState(() => _stoolCondition = value ?? 'unknown'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _energyLevel,
                  decoration: const InputDecoration(labelText: '활력 상태'),
                  items: const [
                    DropdownMenuItem(value: 'very_active', child: Text('매우 활발')),
                    DropdownMenuItem(value: 'active', child: Text('활발')),
                    DropdownMenuItem(value: 'normal', child: Text('보통')),
                    DropdownMenuItem(value: 'low', child: Text('기운 없음')),
                    DropdownMenuItem(value: 'lethargic', child: Text('무기력')),
                  ],
                  onChanged: (value) =>
                      setState(() => _energyLevel = value ?? 'normal'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: '건강 체크',
                  subtitle: '투약, 구토, 행동 이상 여부를 기록합니다.',
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _medicationGiven,
                  onChanged: (value) => setState(() => _medicationGiven = value),
                  title: const Text('투약 완료'),
                ),
                TextField(
                  controller: _medicationNotesController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: '투약 메모',
                    hintText: '복용 약, 시간, 특이사항',
                  ),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _vomiting,
                  onChanged: (value) => setState(() => _vomiting = value),
                  title: const Text('구토 있음'),
                ),
                TextField(
                  controller: _vomitingNotesController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: '구토 메모',
                    hintText: '횟수, 시간, 상태',
                  ),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _aggression,
                  onChanged: (value) => setState(() => _aggression = value),
                  title: const Text('공격성 보임'),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _anxiety,
                  onChanged: (value) => setState(() => _anxiety = value),
                  title: const Text('불안 행동 보임'),
                ),
                TextField(
                  controller: _behaviorNotesController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: '행동 메모',
                    hintText: '짖음, 예민함, 사람/동물 반응 등',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _healthNotesController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: '건강 메모',
                    hintText: '식욕 저하, 상처, 병원 소견 등',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle(
                  title: '수치 및 특이사항',
                  subtitle: '체중, 체온, 기타 메모를 추가로 남길 수 있습니다.',
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _weightController,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: '체중(kg)',
                    hintText: '예: 7.4',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _temperatureController,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: '체온(°C)',
                    hintText: '예: 38.5',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _specialObservationsController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: '특이사항',
                    hintText: '산책, 식사 반응, 외부 자극 반응 등',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              OutlinedButton.icon(
                onPressed: _submitting ? null : () => _submit(isDraft: true),
                icon: _submitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save_outlined),
                label: const Text('임시 저장'),
              ),
              FilledButton.icon(
                onPressed: _submitting ? null : () => _submit(isDraft: false),
                icon: _submitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.check_rounded),
                label: const Text('저장 완료'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppPage(
      title: '문서',
      subtitle: '문서 생성과 다운로드는 현재 웹 대시보드에서 관리합니다.',
      child: Center(
        child: SurfaceCard(
          minWidth: 360,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.description_outlined, size: 48, color: AppTheme.primary),
              SizedBox(height: 16),
              Text(
                '모바일 범위 안내',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
              ),
              SizedBox(height: 8),
              Text(
                '이번 단계에서는 강아지 조회, 일일 케어 입력, 건강 알림 처리까지 모바일 API 연결을 완료했습니다. 문서 생성은 웹에서 같은 DB를 사용해 이어집니다.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.mutedText, height: 1.45),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppPage(
      title: '설정',
      subtitle: '에뮬레이터와 로컬 API 연결 값을 여기서 확인할 수 있습니다.',
      child: ListView(
        children: [
          ResponsiveWrap(
            children: [
              SurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle(
                      title: 'API 연결 정보',
                      subtitle: 'Android 에뮬레이터 기본값은 10.0.2.2:3000입니다.',
                    ),
                    const SizedBox(height: 12),
                    _ReadOnlyField(label: 'Base URL', value: ApiConfig.baseUrl),
                    _ReadOnlyField(label: 'Shelter ID', value: ApiConfig.shelterId),
                  ],
                ),
              ),
              const SurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SectionTitle(
                      title: '실행 팁',
                      subtitle: '환경에 따라 dart-define으로 주소를 분리할 수 있습니다.',
                    ),
                    SizedBox(height: 12),
                    SelectableText(
                      'flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000 --dart-define=SHELTER_ID=11111111-1111-1111-1111-111111111111',
                      style: TextStyle(height: 1.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.mutedText,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppTheme.border),
            ),
            child: SelectableText(value),
          ),
        ],
      ),
    );
  }
}

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 12),
          Text(
            '데이터를 불러오는 중입니다...',
            style: TextStyle(color: AppTheme.mutedText),
          ),
        ],
      ),
    );
  }
}

class _StatusView extends StatelessWidget {
  const _StatusView({
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: SurfaceCard(
          minWidth: 320,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 48, color: AppTheme.primary),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppTheme.mutedText,
                  height: 1.45,
                ),
              ),
              if (actionLabel != null && onAction != null) ...[
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: onAction,
                  child: Text(actionLabel!),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _InlineMessageCard extends StatelessWidget {
  const _InlineMessageCard({
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return SurfaceCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.warning),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: const TextStyle(
                    color: AppTheme.mutedText,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CareRecordSummary extends StatelessWidget {
  const _CareRecordSummary({required this.record});

  final DailyCareRecord record;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppChip(
            label: record.summaryLabel,
            backgroundColor: record.summaryColor.withValues(alpha: 0.14),
            foregroundColor: record.summaryColor,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  record.date,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                Text(
                  '급여: ${record.feedingStatus.label} · 음수: ${record.waterIntake} · 활력: ${record.energyLabel}',
                  style: const TextStyle(
                    color: AppTheme.mutedText,
                    height: 1.45,
                  ),
                ),
                if ((record.healthNotes ?? '').isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    record.healthNotes!,
                    style: const TextStyle(height: 1.45),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AlertActionCard extends StatelessWidget {
  const _AlertActionCard({
    required this.alert,
    required this.resolving,
    required this.onOpenDog,
    required this.onResolve,
  });

  final HealthAlert alert;
  final bool resolving;
  final VoidCallback onOpenDog;
  final VoidCallback onResolve;

  @override
  Widget build(BuildContext context) {
    final color = switch (alert.priorityCode) {
      'critical' => AppTheme.danger,
      'high' => AppTheme.warning,
      _ => AppTheme.accent,
    };

    return SurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${alert.dogName} · ${alert.type}',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              AppChip(
                label: alert.priority,
                backgroundColor: color.withValues(alpha: 0.14),
                foregroundColor: color,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            alert.title,
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Text(
            alert.description,
            style: const TextStyle(
              color: AppTheme.mutedText,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              OutlinedButton.icon(
                onPressed: onOpenDog,
                icon: const Icon(Icons.open_in_new_rounded),
                label: const Text('상세 보기'),
              ),
              FilledButton.icon(
                onPressed: resolving ? null : onResolve,
                icon: resolving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.check_circle_rounded),
                label: const Text('해결 처리'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyInlineText extends StatelessWidget {
  const _EmptyInlineText({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Text(
      message,
      style: const TextStyle(
        color: AppTheme.mutedText,
        height: 1.45,
      ),
    );
  }
}

DailyCareRecord? _findTodayRecord(List<DailyCareRecord> records) {
  final today = _todayIso();
  for (final record in records) {
    if (record.date == today) return record;
  }
  return null;
}

int? _parseInt(String value) {
  if (value.trim().isEmpty) return null;
  return int.tryParse(value.trim());
}

double? _parseDouble(String value) {
  if (value.trim().isEmpty) return null;
  return double.tryParse(value.trim());
}

String? _cleanText(String value) {
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

String _friendlyError(Object error) {
  final message = error.toString();
  if (message.contains('Failed host lookup') ||
      message.contains('Connection refused') ||
      message.contains('SocketException')) {
    return 'API 서버에 연결하지 못했습니다. Next.js 개발 서버가 실행 중인지 확인해 주세요.';
  }
  if (message.startsWith('Exception: ')) {
    return message.replaceFirst('Exception: ', '');
  }
  return '요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

String _todayIso() {
  final now = DateTime.now();
  final month = now.month.toString().padLeft(2, '0');
  final day = now.day.toString().padLeft(2, '0');
  return '${now.year}-$month-$day';
}
