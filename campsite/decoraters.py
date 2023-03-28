
from django.shortcuts import redirect

#管理者制限するデコレータ
def superuser_restriction(func):
    def checker(request):
        if request.user.is_superuser:
            return func(request)
        else:
            return redirect('campsite:index')
    return checker
