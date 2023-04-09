from openticket.utils import ReadOnlyIsAuthenticatedView
from accounts.models import Organization, Member
from accounts.serializers import OrganizationSerializer, MemberSerializer
from django_filters.rest_framework import DjangoFilterBackend


class OrganizationView(ReadOnlyIsAuthenticatedView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name"]

    def get_queryset(self):
        if self.request is None:
            return self.queryset.none()
        if self.request.user.member is None:
            return self.queryset.none()
        return self.queryset.filter(pk=self.request.user.member.organization.pk)


class MemberView(ReadOnlyIsAuthenticatedView):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["user", "organization"]

    def get_queryset(self):
        if self.request is None:
            return self.queryset.none()
        if self.request.user.member is None:
            return self.queryset.none()
        return self.queryset.filter(organization=self.request.user.member.organization)
